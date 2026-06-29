import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import * as Schema from "effect/Schema";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";
import { SqlError } from "effect/unstable/sql/SqlError";

import { FileTooLargeError } from "#/lib/errors/upload/file-size";
import { FileUploadError } from "#/lib/errors/upload/file-upload-error";
import { InvalidFileTypeError } from "#/lib/errors/upload/invalid-file";
import { UsageLimitExceededError } from "#/lib/errors/upload/usage-limit";

import { AuthMiddleware } from "../-middlewares/auth";

export class UploadApi extends HttpApiGroup.make("upload")
  .add(
    HttpApiEndpoint.post("uploadArtifacts", "/upload-artifacts", {
      error: [
        FileTooLargeError,
        UsageLimitExceededError,
        InvalidFileTypeError,
        FileUploadError,
        EffectDrizzleQueryError,
        SqlError,
      ],
      payload: Schema.Struct({
        file: Schema.File,
        name: Schema.optional(Schema.String),
      }).pipe(HttpApiSchema.asMultipart()),
      success: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
        }),
        message: Schema.String,
      }),
    })
  )
  .middleware(AuthMiddleware) {}
