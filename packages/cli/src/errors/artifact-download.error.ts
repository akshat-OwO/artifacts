import * as Schema from "effect/Schema";

export class ArtifactDownloadError extends Schema.TaggedError<ArtifactDownloadError>()(
  "ArtifactDownloadError",
  {
    cause: Schema.Unknown,
  }
) {}
