import * as Schema from "effect/Schema";

export class UsageLimitExceededError extends Schema.TaggedError<UsageLimitExceededError>()(
  "UsageLimitExceededError",
  {
    currentBytes: Schema.Int,
    incomingBytes: Schema.Int,
    maximumBytes: Schema.Int,
  },
  { httpApiStatus: 413 }
) {}
