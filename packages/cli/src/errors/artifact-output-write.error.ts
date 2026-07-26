import * as Schema from "effect/Schema";

export class ArtifactOutputWriteError extends Schema.TaggedErrorClass<ArtifactOutputWriteError>()(
  "ArtifactOutputWriteError",
  {
    cause: Schema.Unknown,
    path: Schema.String,
  }
) {}
