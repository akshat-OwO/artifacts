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
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

export const UploadApiHandler = HttpApiBuilder.group(
  Api,
  "upload",
  (handlers) =>
    handlers.handle("uploadArtifacts", ({ payload }) =>
      Effect.gen(function* handle() {
        const { file } = payload;
        const storage = yield* Storage;

        const user = yield* AuthUser;

        if (file.size > MAX_FILE_SIZE) {
          return yield* new FileTooLargeError({
            actualBytes: file.size,
            maximumBytes: MAX_FILE_SIZE,
          });
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
          userId: user.id,
        });

        return {
          data: { id: artifactId },
          message: "Successully uploaded artifact",
        };
      }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
    )
);
