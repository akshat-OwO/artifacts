import * as Schema from "effect/Schema";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const USER_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;
export const USER_UPLOAD_GRACE_LIMIT_BYTES = 15 * 1024 * 1024;

export class FileTooLargeError extends Schema.TaggedErrorClass<FileTooLargeError>()(
  "FileTooLargeError",
  {
    actualBytes: Schema.Int,
    maximumBytes: Schema.Int,
  },
  { httpApiStatus: 413 }
) {}
