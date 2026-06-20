import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import * as Schema from "effect/Schema";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import { SqlError } from "effect/unstable/sql/SqlError";

import { FileTooLargeError } from "#/lib/errors/upload/file-size";
import { FileUploadError } from "#/lib/errors/upload/file-upload-error";
import { InvalidFileTypeError } from "#/lib/errors/upload/invalid-file";

import { AuthMiddleware } from "../-middlewares/auth";

export class UploadApi extends HttpApiGroup.make("upload")
  .add(
    HttpApiEndpoint.post("uploadArtifacts", "/upload-artifacts", {
      error: [
        FileTooLargeError,
        InvalidFileTypeError,
        FileUploadError,
        EffectDrizzleQueryError,
        SqlError,
      ],
      payload: Schema.Struct({
        file: Schema.File,
      }),
      success: Schema.Struct({
        data: Schema.Struct({
          id: Schema.String,
        }),
        message: Schema.String,
      }),
    })
  )
  .middleware(AuthMiddleware) {}
