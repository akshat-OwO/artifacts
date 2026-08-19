import { and, eq, sql } from "drizzle-orm";
import * as D1Drizzle from "drizzle-orm/effect-d1";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { ANALYTICS_EVENTS } from "#/lib/analytics/events";
import { captureServerEvent, getAnalyticsUrl } from "#/lib/analytics/server";
import { AuthUser } from "#/lib/auth/context";
import { D1ClientLive } from "#/lib/db";
import { artifact } from "#/lib/db/schemas";
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
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

const HTML_FILE_TYPES = new Set(["text/html", "application/xhtml+xml"]);

const isHtmlFile = (file: File): boolean =>
  HTML_FILE_TYPES.has(file.type) ||
  file.name.endsWith(".html") ||
  file.name.endsWith(".htm");

const getUserArtifactUsageBytes = () =>
  sql<number>`coalesce(sum(${artifact.artifactSizeBytes}), 0)`.mapWith(Number);

const getRequestFormData = (request: Request) =>
  Effect.tryPromise({
    catch: () => new FileUploadError(),
    try: () => request.formData(),
  });

const artifactColumns = {
  artifactKey: artifact.artifactKey,
  createdAt: artifact.createdAt,
  id: artifact.id,
  isPublic: artifact.isPublic,
  name: artifact.name,
  updatedAt: artifact.updatedAt,
};

export const ArtifactsApiHandler = HttpApiBuilder.group(
  Api,
  "artifacts",
  (handlers) =>
    handlers
      .handle("getArtifactById", ({ params: { artifactId } }) =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});
          const user = yield* AuthUser;

          const [artifactRow] = yield* db
            .select(artifactColumns)
            .from(artifact)
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .limit(1);

          if (!artifactRow) {
            return yield* new ArtifactNotFoundError();
          }

          return { author: user.name, ...artifactRow };
        }).pipe(Effect.provide(D1ClientLive))
      )
      .handle("getArtifactPreviewByKey", ({ params: { artifactKey } }) =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});
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
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, D1ClientLive)))
      )
      .handle("getArtifacts", () =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});
          const user = yield* AuthUser;

          const artifactsRow = yield* db
            .select()
            .from(artifact)
            .where(eq(artifact.userId, user.id));

          return artifactsRow.map((artifactRow) => ({
            author: user.name,
            ...artifactRow,
          }));
        }).pipe(Effect.provide(D1ClientLive))
      )
      .handleRaw("updateArtifact", ({ params: { artifactId }, request }) =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});
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

          if (file) {
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

            const [usage] = yield* db
              .select({ artifactSizeBytes: getUserArtifactUsageBytes() })
              .from(artifact)
              .where(eq(artifact.userId, user.id));
            const currentBytes = usage?.artifactSizeBytes ?? 0;
            const projectedBytes =
              currentBytes - existingArtifact.artifactSizeBytes + file.size;

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
          }

          const [updatedArtifact] = yield* db
            .update(artifact)
            .set({
              ...(file ? { artifactSizeBytes: file.size } : {}),
              ...(name ? { name } : {}),
            })
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .returning(artifactColumns);

          if (!updatedArtifact) {
            return yield* new ArtifactNotFoundError();
          }

          yield* captureServerEvent({
            distinctId: user.id,
            event: ANALYTICS_EVENTS.artifactUpdated,
            properties: {
              $current_url: getAnalyticsUrl(`/a/${artifactId}`),
              artifact_id: artifactId,
              file_replaced: Boolean(file),
              name_changed: Boolean(name),
              path: `/a/${artifactId}`,
              source: "api",
            },
          });

          return { author: user.name, ...updatedArtifact };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, D1ClientLive)))
      )
      .handle(
        "setArtifactVisibility",
        ({ params: { artifactId }, payload: { isPublic } }) =>
          Effect.gen(function* handler() {
            const db = yield* D1Drizzle.makeWithDefaults({});
            const user = yield* AuthUser;

            const [updatedArtifact] = yield* db
              .update(artifact)
              .set({ isPublic })
              .where(
                and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
              )
              .returning(artifactColumns);

            if (!updatedArtifact) {
              return yield* new ArtifactNotFoundError();
            }

            yield* captureServerEvent({
              distinctId: user.id,
              event: isPublic
                ? ANALYTICS_EVENTS.artifactShared
                : ANALYTICS_EVENTS.artifactUnshared,
              properties: {
                $current_url: getAnalyticsUrl(
                  isPublic ? `/s/${artifactId}` : `/a/${artifactId}`
                ),
                artifact_id: artifactId,
                path: isPublic ? `/s/${artifactId}` : `/a/${artifactId}`,
                source: "api",
              },
            });

            return { author: user.name, ...updatedArtifact };
          }).pipe(Effect.provide(D1ClientLive))
      )
      .handle("deleteArtifact", ({ params: { artifactId } }) =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});
          const storage = yield* Storage;
          const user = yield* AuthUser;

          const [deletedArtifact] = yield* db
            .delete(artifact)
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, user.id))
            )
            .returning({ artifactKey: artifact.artifactKey });

          if (!deletedArtifact) {
            return yield* new ArtifactNotFoundError();
          }

          yield* Effect.promise(() =>
            storage.r2.delete([deletedArtifact.artifactKey], {
              concurrency: 2,
              stopOnError: false,
            })
          );

          yield* captureServerEvent({
            distinctId: user.id,
            event: ANALYTICS_EVENTS.artifactDeleted,
            properties: {
              $current_url: getAnalyticsUrl(`/a/${artifactId}`),
              artifact_id: artifactId,
              path: `/a/${artifactId}`,
              source: "api",
            },
          });

          return { message: "Artifact deleted successfully." };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, D1ClientLive)))
      )
);
