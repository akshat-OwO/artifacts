import * as Schema from "effect/Schema";

export class PreviewError extends Schema.TaggedError<PreviewError>()(
  "PreviewError",
  {}
) {}
