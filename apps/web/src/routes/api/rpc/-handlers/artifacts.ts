import { and, eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AuthUser } from "#/lib/auth/context";
import { PgClientLive } from "#/lib/db";
import { artifact } from "#/lib/db/schemas";
import { ArtifactNotFoundError } from "#/lib/errors/artifacts/artifact-not-found";
import { PreviewError } from "#/lib/errors/artifacts/preview-error";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

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
);
