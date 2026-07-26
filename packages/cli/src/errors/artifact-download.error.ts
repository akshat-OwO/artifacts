import * as Schema from "effect/Schema";

export class ArtifactDownloadError extends Schema.TaggedErrorClass<ArtifactDownloadError>()(
  "ArtifactDownloadError",
  {
    cause: Schema.Unknown,
  }
) {}
