import * as Schema from "effect/Schema";

export class FileUploadError extends Schema.TaggedErrorClass<FileUploadError>()(
  "FileUploadError",
  {},
  { httpApiStatus: 502 }
) {}
