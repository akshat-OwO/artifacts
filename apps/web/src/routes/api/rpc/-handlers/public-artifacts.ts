import { and, eq } from "drizzle-orm";
import * as D1Drizzle from "drizzle-orm/effect-d1";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { getDefaultArtifactPreviewUrl } from "#/lib/artifacts/preview";
import { D1ClientLive } from "#/lib/db";
import { artifact, user } from "#/lib/db/schemas";
import { ArtifactNotFoundError } from "#/lib/errors/artifacts/artifact-not-found";
import { PreviewError } from "#/lib/errors/artifacts/preview-error";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

export const PublicArtifactsApiHandler = HttpApiBuilder.group(
  Api,
  "publicArtifacts",
  (handlers) =>
    handlers
      .handle("getPublicArtifactById", ({ params: { artifactId } }) =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});

          const [artifactRow] = yield* db
            .select({
              artifactKey: artifact.artifactKey,
              author: user.name,
              createdAt: artifact.createdAt,
              id: artifact.id,
              name: artifact.name,
              updatedAt: artifact.updatedAt,
            })
            .from(artifact)
            .innerJoin(user, eq(artifact.userId, user.id))
            .where(
              and(eq(artifact.id, artifactId), eq(artifact.isPublic, true))
            )
            .limit(1);

          if (!artifactRow) {
            return yield* new ArtifactNotFoundError();
          }

          return {
            ...artifactRow,
            previewImageUrl: getDefaultArtifactPreviewUrl(
              process.env.VITE_BASE_URL
            ),
          };
        }).pipe(Effect.provide(D1ClientLive))
      )
      .handle("getPublicArtifactPreviewByKey", ({ params: { artifactKey } }) =>
        Effect.gen(function* handler() {
          const db = yield* D1Drizzle.makeWithDefaults({});
          const storage = yield* Storage;

          const [artifactRow] = yield* db
            .select({ id: artifact.id })
            .from(artifact)
            .where(
              and(
                eq(artifact.artifactKey, artifactKey),
                eq(artifact.isPublic, true)
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
);
