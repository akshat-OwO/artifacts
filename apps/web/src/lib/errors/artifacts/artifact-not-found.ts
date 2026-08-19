import * as Schema from "effect/Schema";

export class ArtifactNotFoundError extends Schema.TaggedError<ArtifactNotFoundError>()(
  "ArtifactNotFoundError",
  {},
  { httpApiStatus: 404 }
) {}
