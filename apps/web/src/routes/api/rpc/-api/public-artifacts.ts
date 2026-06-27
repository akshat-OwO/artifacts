import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import * as Schema from "effect/Schema";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import { SqlError } from "effect/unstable/sql/SqlError";

import { ArtifactNotFoundError } from "#/lib/errors/artifacts/artifact-not-found";
import { PreviewError } from "#/lib/errors/artifacts/preview-error";
import { GetPublicArtifactById } from "#/lib/schemas/artifacts";

export class PublicArtifactsApi extends HttpApiGroup.make("publicArtifacts")
  .add(
    HttpApiEndpoint.get(
      "getPublicArtifactById",
      "/public/artifacts/:artifactId",
      {
        error: [EffectDrizzleQueryError, SqlError, ArtifactNotFoundError],
        params: Schema.Struct({
          artifactId: Schema.String.check(Schema.isUUID()),
        }),
        success: GetPublicArtifactById,
      }
    )
  )
  .add(
    HttpApiEndpoint.get(
      "getPublicArtifactPreviewByKey",
      "/public/artifacts/preview/:artifactKey",
      {
        error: [EffectDrizzleQueryError, SqlError, PreviewError],
        params: Schema.Struct({
          artifactKey: Schema.String,
        }),
        success: Schema.String,
      }
    )
  ) {}
