import * as Schema from "effect/Schema";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";

import { PreviewError } from "../errors/preview-error";
import { ApiKeyAuth } from "../middlewares/api-key-auth";

const WebpImage = Schema.Uint8Array.pipe(
  HttpApiSchema.asUint8Array({ contentType: "image/webp" })
);

export class PreviewApi extends HttpApiGroup.make("preview")
  .add(
    HttpApiEndpoint.get("capture", "/preview", {
      error: PreviewError,
      query: {
        url: Schema.String,
      },
      success: WebpImage,
    })
  )
  .add(
    HttpApiEndpoint.post("captureAsync", "/preview", {
      error: PreviewError,
      payload: Schema.Struct({
        url: Schema.String,
        webhookUrl: Schema.String,
      }),
      success: Schema.Struct({
        message: Schema.String,
      }),
    })
  )
  .middleware(ApiKeyAuth) {}
