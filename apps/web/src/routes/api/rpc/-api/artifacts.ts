import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import * as Schema from "effect/Schema";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import { SqlError } from "effect/unstable/sql/SqlError";

import { ArtifactNotFoundError } from "#/lib/errors/artifacts/artifact-not-found";
import { PreviewError } from "#/lib/errors/artifacts/preview-error";
import { GetArtifactById } from "#/lib/schemas/artifacts";

import { AuthMiddleware } from "../-middlewares/auth";

export class ArtifactsApi extends HttpApiGroup.make("artifacts")
  .add(
    HttpApiEndpoint.get("getArtifactById", "/artifacts/:artifactId", {
      error: [EffectDrizzleQueryError, SqlError, ArtifactNotFoundError],
      params: Schema.Struct({
        artifactId: Schema.String.check(Schema.isUUID()),
      }),
      success: GetArtifactById,
    })
  )
  .add(
    HttpApiEndpoint.get(
      "getArtifactPreviewByKey",
      "/artifacts/preview/:artifactKey",
      {
        error: [EffectDrizzleQueryError, SqlError, PreviewError],
        params: Schema.Struct({
          artifactKey: Schema.String,
        }),
        success: Schema.String,
      }
    )
  )
  .add(
    HttpApiEndpoint.get("getArtifacts", "/artifacts", {
      error: [EffectDrizzleQueryError, SqlError, PreviewError],
      success: Schema.Array(GetArtifactById),
    })
  )
  .middleware(AuthMiddleware) {}
