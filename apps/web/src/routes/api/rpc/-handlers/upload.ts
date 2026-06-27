import { eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AuthUser } from "#/lib/auth/context";
import { PgClientLive } from "#/lib/db";
import { artifact } from "#/lib/db/schemas";
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

export const UploadApiHandler = HttpApiBuilder.group(
  Api,
  "upload",
  (handlers) =>
    handlers.handle("uploadArtifacts", ({ payload }) =>
      Effect.gen(function* handle() {
        const { file } = payload;
        const name = payload.name?.trim();
        const storage = yield* Storage;

        const user = yield* AuthUser;

        if (file.size > MAX_FILE_SIZE) {
          return yield* new FileTooLargeError({
            actualBytes: file.size,
            maximumBytes: MAX_FILE_SIZE,
          });
        }

        if (!isHtmlFile(file)) {
          return yield* new InvalidFileTypeError();
        }

        const artifactId = crypto.randomUUID();
        const artifactKey = `artifacts/${user.id}/${artifactId}`;

        const uploadedFile = yield* Effect.tryPromise({
          catch: () => new FileUploadError(),
          try: () =>
            storage.r2.upload(artifactKey, file, {
              contentType: "text/html",
              metadata: { userId: user.id },
            }),
        });

        const db = yield* PgDrizzle.makeWithDefaults();

        yield* db.insert(artifact).values({
          artifactKey: uploadedFile.key,
          id: artifactId,
          ...(name ? { name } : {}),
          userId: user.id,
        });

        const capturePreview = Effect.gen(function* capturePreview() {
          const backgroundDb = yield* PgDrizzle.makeWithDefaults();
          const scoutApi = yield* ScoutApiService;
          const backgroundStorage = yield* Storage;
          const previewUrl = yield* Effect.promise(() =>
            backgroundStorage.r2.url(uploadedFile.key)
          );
          const preview = yield* scoutApi.getCapture(previewUrl);
          const previewKey = `artifacts/${user.id}/${artifactId}/preview`;

          yield* Effect.promise(() =>
            backgroundStorage.r2.upload(previewKey, preview, {
              contentType: "image/webp",
              metadata: { artifactId, userId: user.id },
            })
          );

          yield* backgroundDb
            .update(artifact)
            .set({ previewKey })
            .where(eq(artifact.id, artifactId));
        }).pipe(
          Effect.provide(
            Layer.mergeAll(ScoutApiLive, StorageLive, PgClientLive)
          ),
          Effect.catchCause((cause) =>
            Effect.logError("Failed to generate artifact preview", cause)
          )
        );

        yield* Effect.forkDetach(capturePreview);

        return {
          data: { id: artifactId },
          message: "Successully uploaded artifact",
        };
      }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
    )
);
