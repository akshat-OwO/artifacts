import * as Schema from "effect/Schema";

export const UsageInfo = Schema.Struct({
  graceLimitBytes: Schema.Int,
  limitBytes: Schema.Int,
  usedBytes: Schema.Int,
});
