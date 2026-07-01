import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import * as Schema from "effect/Schema";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";
import { SqlError } from "effect/unstable/sql/SqlError";

import { FileUploadError } from "#/lib/errors/upload/file-upload-error";

import { ScoutApiKeyMiddleware } from "../-middlewares/scout-api-key";

const WebpImage = Schema.Uint8Array.pipe(
  HttpApiSchema.asUint8Array({ contentType: "image/webp" })
);

export class PreviewWebhookApi extends HttpApiGroup.make("previewWebhook")
  .add(
    HttpApiEndpoint.post(
      "completeArtifactPreview",
      "/artifacts/:artifactId/preview-webhook/:userId",
      {
        error: [EffectDrizzleQueryError, SqlError, FileUploadError],
        params: Schema.Struct({
          artifactId: Schema.String.check(Schema.isUUID()),
          userId: Schema.String,
        }),
        payload: WebpImage,
        success: Schema.Struct({
          message: Schema.String,
        }),
      }
    )
  )
  .middleware(ScoutApiKeyMiddleware) {}
