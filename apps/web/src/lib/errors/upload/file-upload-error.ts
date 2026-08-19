import * as Schema from "effect/Schema";

export class FileUploadError extends Schema.TaggedError<FileUploadError>()(
  "FileUploadError",
  {},
  { httpApiStatus: 502 }
) {}
