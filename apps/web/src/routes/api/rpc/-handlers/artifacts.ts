import { and, eq, sql } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AuthUser } from "#/lib/auth/context";
import { PgClientLive } from "#/lib/db";
import { artifact, DEFAULT_ARTIFACT_PREVIEW_KEY } from "#/lib/db/schemas";
import { ArtifactNotFoundError } from "#/lib/errors/artifacts/artifact-not-found";
import { PreviewError } from "#/lib/errors/artifacts/preview-error";
import {
  FileTooLargeError,
  MAX_FILE_SIZE,
  USER_UPLOAD_GRACE_LIMIT_BYTES,
} from "#/lib/errors/upload/file-size";
import { FileUploadError } from "#/lib/errors/upload/file-upload-error";
import { InvalidFileTypeError } from "#/lib/errors/upload/invalid-file";
import { UsageLimitExceededError } from "#/lib/errors/upload/usage-limit";
import { ScoutApiLive, ScoutApiService } from "#/lib/scout";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

const HTML_FILE_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const isHtmlFile = (file: File): boolean =>
  HTML_FILE_TYPES.has(file.type) ||
  file.name.endsWith(".html") ||
  file.name.endsWith(".htm");

const getUserArtifactUsageBytes = () =>
  sql<number>`coalesce(sum(${artifact.artifactSizeBytes}), 0)::integer`.mapWith(
    Number
  );

const getRequestFormData = (request: Request) =>
  Effect.tryPromise({
    catch: () => new FileUploadError(),
    try: () => request.formData(),
  });

const captureArtifactPreview = ({
  artifactId,
  artifactKey,
  userId,
}: {
  artifactId: string;
  artifactKey: string;
  userId: string;
}) =>
  Effect.gen(function* capturePreview() {
    const scoutApi = yield* ScoutApiService;
    const storage = yield* Storage;
    const previewUrl = yield* Effect.promise(() => storage.r2.url(artifactKey));
    yield* scoutApi.scheduleCapture({
      artifactId,
      url: previewUrl,
      userId,
    });
    yield* Effect.logInfo("Scheduled artifact preview with scout", {
      artifactId,
      source: "update",
      userId,
    });
  }).pipe(
    Effect.provide(Layer.mergeAll(ScoutApiLive, StorageLive)),
    Effect.catchCause((cause) =>
      Effect.logError("Failed to schedule artifact preview", cause)
    )
  );

export const ArtifactsApiHandler = HttpApiBuilder.group(
  Api,
  "artifacts",
  (handlers) =>
    handlers
      .handle("getArtifactById", ({ params: { artifactId } }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const user = yield* AuthUser;

          const [artifactRow] = yield* db
            .select({
              artifactKey: artifact.artifactKey,
              createdAt: artifact.createdAt,
              id: artifact.id,
              isPublic: artifact.isPublic,
              name: artifact.name,
              previewKey: artifact.previewKey,
              updatedAt: artifact.updatedAt,
            })
            .from(artifact)
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .limit(1);

          if (!artifactRow) {
            return yield* new ArtifactNotFoundError();
          }

          return { author: user.name, ...artifactRow };
        }).pipe(Effect.provide(PgClientLive))
      )
      .handle("getArtifactPreviewByKey", ({ params: { artifactKey } }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;
          const user = yield* AuthUser;

          const [artifactRow] = yield* db
            .select({ id: artifact.id })
            .from(artifact)
            .where(
              and(
                eq(artifact.artifactKey, artifactKey),
                eq(artifact.userId, user.id)
              )
            )
            .limit(1);

          if (!artifactRow) {
            return yield* new PreviewError();
          }

          const previewUrl = yield* Effect.tryPromise({
            catch: () => new PreviewError(),
            try: () => storage.r2.url(artifactKey),
          });

          return previewUrl;
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
      .handle("getArtifacts", () =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;
          const user = yield* AuthUser;

          const artifactsRow = yield* db
            .select()
            .from(artifact)
            .where(eq(artifact.userId, user.id));

          return yield* Effect.all(
            artifactsRow.map((artifactRow) =>
              Effect.gen(function* resolvePreviewUrl() {
                const previewKey =
                  artifactRow.previewKey === DEFAULT_ARTIFACT_PREVIEW_KEY
                    ? `/${DEFAULT_ARTIFACT_PREVIEW_KEY}`
                    : yield* Effect.tryPromise({
                        catch: () => new PreviewError(),
                        try: () => storage.r2.url(artifactRow.previewKey),
                      });

                return {
                  author: user.name,
                  ...artifactRow,
                  previewKey,
                };
              })
            ),
            { concurrency: 8 }
          );
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
      .handleRaw("updateArtifact", ({ params: { artifactId }, request }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;
          const user = yield* AuthUser;
          const formData = yield* getRequestFormData(request.source as Request);
          const fileEntry = formData.get("file");
          const nameEntry = formData.get("name");
          const file = fileEntry instanceof File ? fileEntry : undefined;
          const name =
            typeof nameEntry === "string" ? nameEntry.trim() : undefined;

          if (file) {
            if (file.size > MAX_FILE_SIZE) {
              return yield* new FileTooLargeError({
                actualBytes: file.size,
                maximumBytes: MAX_FILE_SIZE,
              });
            }

            if (!isHtmlFile(file)) {
              return yield* new InvalidFileTypeError();
            }
          }

          const updateResult = file
            ? yield* db.transaction((tx) =>
                Effect.gen(function* transaction() {
                  yield* tx.execute(
                    sql`select pg_advisory_xact_lock(hashtext(${user.id}))`
                  );

                  const [existingArtifact] = yield* tx
                    .select()
                    .from(artifact)
                    .where(
                      and(
                        eq(artifact.id, artifactId),
                        eq(artifact.userId, user.id)
                      )
                    )
                    .limit(1);

                  if (!existingArtifact) {
                    return yield* new ArtifactNotFoundError();
                  }

                  const [usage] = yield* tx
                    .select({
                      artifactSizeBytes: getUserArtifactUsageBytes(),
                    })
                    .from(artifact)
                    .where(eq(artifact.userId, user.id));
                  const currentBytes = usage?.artifactSizeBytes ?? 0;
                  const projectedBytes =
                    currentBytes -
                    existingArtifact.artifactSizeBytes +
                    file.size;

                  if (projectedBytes > USER_UPLOAD_GRACE_LIMIT_BYTES) {
                    return yield* new UsageLimitExceededError({
                      currentBytes,
                      incomingBytes: file.size,
                      maximumBytes: USER_UPLOAD_GRACE_LIMIT_BYTES,
                    });
                  }

                  yield* Effect.tryPromise({
                    catch: () => new FileUploadError(),
                    try: () =>
                      storage.r2.upload(existingArtifact.artifactKey, file, {
                        contentType: "text/html",
                        metadata: { userId: user.id },
                      }),
                  });

                  const [updatedArtifact] = yield* tx
                    .update(artifact)
                    .set({
                      artifactSizeBytes: file.size,
                      ...(name ? { name } : {}),
                      previewKey: DEFAULT_ARTIFACT_PREVIEW_KEY,
                    })
                    .where(
                      and(
                        eq(artifact.id, artifactId),
                        eq(artifact.userId, user.id)
                      )
                    )
                    .returning({
                      artifactKey: artifact.artifactKey,
                      createdAt: artifact.createdAt,
                      id: artifact.id,
                      isPublic: artifact.isPublic,
                      name: artifact.name,
                      previewKey: artifact.previewKey,
                      updatedAt: artifact.updatedAt,
                    });

                  if (!updatedArtifact) {
                    return yield* new ArtifactNotFoundError();
                  }

                  return {
                    artifact: updatedArtifact,
                    previewArtifactKey: existingArtifact.artifactKey,
                  };
                })
              )
            : yield* Effect.gen(function* updateMetadata() {
                const [updatedArtifact] = yield* db
                  .update(artifact)
                  .set(name ? { name } : {})
                  .where(
                    and(
                      eq(artifact.id, artifactId),
                      eq(artifact.userId, user.id)
                    )
                  )
                  .returning({
                    artifactKey: artifact.artifactKey,
                    createdAt: artifact.createdAt,
                    id: artifact.id,
                    isPublic: artifact.isPublic,
                    name: artifact.name,
                    previewKey: artifact.previewKey,
                    updatedAt: artifact.updatedAt,
                  });

                if (!updatedArtifact) {
                  return yield* new ArtifactNotFoundError();
                }

                return {
                  artifact: updatedArtifact,
                  previewArtifactKey: undefined,
                };
              });

          if (updateResult.previewArtifactKey) {
            yield* captureArtifactPreview({
              artifactId,
              artifactKey: updateResult.previewArtifactKey,
              userId: user.id,
            });
          }

          return { author: user.name, ...updateResult.artifact };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
      .handle(
        "setArtifactVisibility",
        ({ params: { artifactId }, payload: { isPublic } }) =>
          Effect.gen(function* handler() {
            const db = yield* PgDrizzle.makeWithDefaults();
            const user = yield* AuthUser;

            const [updatedArtifact] = yield* db
              .update(artifact)
              .set({ isPublic })
              .where(
                and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
              )
              .returning({
                artifactKey: artifact.artifactKey,
                createdAt: artifact.createdAt,
                id: artifact.id,
                isPublic: artifact.isPublic,
                name: artifact.name,
                previewKey: artifact.previewKey,
                updatedAt: artifact.updatedAt,
              });

            if (!updatedArtifact) {
              return yield* new ArtifactNotFoundError();
            }

            return { author: user.name, ...updatedArtifact };
          }).pipe(Effect.provide(PgClientLive))
      )
      .handle("deleteArtifact", ({ params: { artifactId } }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;
          const user = yield* AuthUser;

          const [deletedArtifact] = yield* db
            .delete(artifact)
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .returning({
              artifactKey: artifact.artifactKey,
              previewKey: artifact.previewKey,
            });

          if (!deletedArtifact) {
            return yield* new ArtifactNotFoundError();
          }

          const keysToDelete = [
            deletedArtifact.artifactKey,
            ...(deletedArtifact.previewKey === DEFAULT_ARTIFACT_PREVIEW_KEY
              ? []
              : [deletedArtifact.previewKey]),
          ];

          yield* Effect.promise(() =>
            storage.r2.delete(keysToDelete, {
              concurrency: 2,
              stopOnError: false,
            })
          );

          return { message: "Artifact deleted successfully." };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
);
