import * as Schema from "effect/Schema";

export class InvalidFileTypeError extends Schema.TaggedErrorClass<InvalidFileTypeError>()(
  "InvalidFileTypeError",
  {},
  { httpApiStatus: 400 }
) {}
