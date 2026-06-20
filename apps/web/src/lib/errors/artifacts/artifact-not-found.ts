import * as Schema from "effect/Schema";

export class ArtifactNotFoundError extends Schema.TaggedErrorClass<ArtifactNotFoundError>()(
  "ArtifactNotFoundError",
  {},
  { httpApiStatus: 404 }
) {}
