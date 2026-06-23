import { and, eq } from "drizzle-orm";
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
} from "#/lib/errors/upload/file-size";
import { FileUploadError } from "#/lib/errors/upload/file-upload-error";
import { InvalidFileTypeError } from "#/lib/errors/upload/invalid-file";
import { ScoutApiLive, ScoutApiService } from "#/lib/scout";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

const HTML_FILE_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const isHtmlFile = (file: File): boolean =>
  HTML_FILE_TYPES.has(file.type) ||
  file.name.endsWith(".html") ||
  file.name.endsWith(".htm");

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
    const db = yield* PgDrizzle.makeWithDefaults();
    const scoutApi = yield* ScoutApiService;
    const storage = yield* Storage;
    const previewUrl = yield* Effect.promise(() => storage.r2.url(artifactKey));
    const preview = yield* scoutApi.getCapture(previewUrl);
    const previewKey = `artifacts/${userId}/${artifactId}/preview`;

    yield* Effect.promise(() =>
      storage.r2.upload(previewKey, preview, {
        contentType: "image/webp",
        metadata: { artifactId, userId },
      })
    );

    yield* db
      .update(artifact)
      .set({ previewKey })
      .where(and(eq(artifact.id, artifactId), eq(artifact.userId, userId)));
  }).pipe(
    Effect.provide(Layer.mergeAll(ScoutApiLive, StorageLive, PgClientLive)),
    Effect.catchCause((cause) =>
      Effect.logError("Failed to generate artifact preview", cause)
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

                return { author: user.id, ...artifactRow, previewKey };
              })
            ),
            { concurrency: 8 }
          );
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
      .handle("updateArtifact", ({ params: { artifactId }, payload }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;
          const user = yield* AuthUser;
          const { file } = payload;
          const name = payload.name?.trim();

          const [existingArtifact] = yield* db
            .select()
            .from(artifact)
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .limit(1);

          if (!existingArtifact) {
            return yield* new ArtifactNotFoundError();
          }

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

            yield* Effect.tryPromise({
              catch: () => new FileUploadError(),
              try: () =>
                storage.r2.upload(existingArtifact.artifactKey, file, {
                  contentType: "text/html",
                  metadata: { userId: user.id },
                }),
            });
          }

          const [updatedArtifact] = yield* db
            .update(artifact)
            .set({
              ...(name ? { name } : {}),
              ...(file ? { previewKey: DEFAULT_ARTIFACT_PREVIEW_KEY } : {}),
            })
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .returning({
              artifactKey: artifact.artifactKey,
              createdAt: artifact.createdAt,
              id: artifact.id,
              name: artifact.name,
              previewKey: artifact.previewKey,
              updatedAt: artifact.updatedAt,
            });

          if (!updatedArtifact) {
            return yield* new ArtifactNotFoundError();
          }

          if (file) {
            yield* Effect.forkDetach(
              captureArtifactPreview({
                artifactId,
                artifactKey: existingArtifact.artifactKey,
                userId: user.id,
              })
            );
          }

          return { author: user.name, ...updatedArtifact };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
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
