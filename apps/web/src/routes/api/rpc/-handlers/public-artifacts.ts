import { and, eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { PgClientLive } from "#/lib/db";
import { artifact, DEFAULT_ARTIFACT_PREVIEW_KEY, user } from "#/lib/db/schemas";
import { ArtifactNotFoundError } from "#/lib/errors/artifacts/artifact-not-found";
import { PreviewError } from "#/lib/errors/artifacts/preview-error";
import { Storage, StorageLive } from "#/lib/storage";

import { Api } from "../-api";

const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";

const getPublicAssetUrl = (assetPath: string) =>
  new URL(
    assetPath,
    process.env.VITE_BASE_URL ?? DEFAULT_LOCAL_BASE_URL
  ).toString();

export const PublicArtifactsApiHandler = HttpApiBuilder.group(
  Api,
  "publicArtifacts",
  (handlers) =>
    handlers
      .handle("getPublicArtifactById", ({ params: { artifactId } }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
          const storage = yield* Storage;

          const [artifactRow] = yield* db
            .select({
              artifactKey: artifact.artifactKey,
              author: user.name,
              createdAt: artifact.createdAt,
              id: artifact.id,
              name: artifact.name,
              previewKey: artifact.previewKey,
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

          const { previewKey, ...publicArtifact } = artifactRow;

          const previewImageUrl =
            previewKey === DEFAULT_ARTIFACT_PREVIEW_KEY
              ? getPublicAssetUrl(DEFAULT_ARTIFACT_PREVIEW_KEY)
              : yield* Effect.tryPromise({
                  catch: () => new PreviewError(),
                  try: () => storage.r2.url(previewKey),
                });

          return { ...publicArtifact, previewImageUrl };
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
      .handle("getPublicArtifactPreviewByKey", ({ params: { artifactKey } }) =>
        Effect.gen(function* handler() {
          const db = yield* PgDrizzle.makeWithDefaults();
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
        }).pipe(Effect.provide(Layer.mergeAll(StorageLive, PgClientLive)))
      )
);
