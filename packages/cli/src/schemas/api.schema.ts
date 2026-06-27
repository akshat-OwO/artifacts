import * as Schema from "effect/Schema";

export const healthCheckSchema = Schema.String;

export const uploadArtifactSchema = Schema.Struct({
  file: Schema.File,
});
