import { and, eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { PgClientLive } from "#/lib/db";
import { artifact } from "#/lib/db/schemas";
import { FileUploadError } from "#/lib/errors/upload/file-upload-error";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

export const PreviewWebhookApiHandler = HttpApiBuilder.group(
  Api,
  "previewWebhook",
  (handlers) =>
    handlers.handle(
      "completeArtifactPreview",
      ({ params: { artifactId, userId }, payload }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;
          const previewKey = `artifacts/${userId}/${artifactId}/preview`;

          yield* Effect.tryPromise({
            catch: () => new FileUploadError(),
            try: () =>
              storage.r2.upload(previewKey, payload, {
                contentType: "image/webp",
                metadata: { artifactId, userId },
              }),
          });

          yield* db
            .update(artifact)
            .set({ previewKey })
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.userId, userId))
            );

          return { message: "Artifact preview updated." };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
    )
);
