import * as Schema from "effect/Schema";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export class FileTooLargeError extends Schema.TaggedErrorClass<FileTooLargeError>()(
  "FileTooLargeError",
  {
    actualBytes: Schema.Int,
    maximumBytes: Schema.Int,
  },
  { httpApiStatus: 413 }
) {}
