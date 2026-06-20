import * as Schema from "effect/Schema";

export class PreviewError extends Schema.TaggedErrorClass<PreviewError>()(
  "PreviewError",
  {
    message: Schema.String,
  },
  { httpApiStatus: 502 }
) {}
