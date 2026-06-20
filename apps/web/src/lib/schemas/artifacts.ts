import * as Schema from "effect/Schema";

export const GetArtifactById = Schema.Struct({
  artifactKey: Schema.String,
  author: Schema.String,
  createdAt: Schema.Date,
  id: Schema.String.check(Schema.isUUID()),
  name: Schema.String,
  previewKey: Schema.String,
  updatedAt: Schema.Date,
});
