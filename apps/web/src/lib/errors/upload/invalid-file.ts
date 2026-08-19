import * as Schema from "effect/Schema";

export class InvalidFileTypeError extends Schema.TaggedError<InvalidFileTypeError>()(
  "InvalidFileTypeError",
  {},
  { httpApiStatus: 400 }
) {}
