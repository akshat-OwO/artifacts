import * as Schema from "effect/Schema";

export class AuthConfigParseError extends Schema.TaggedError<AuthConfigParseError>()(
  "AuthConfigParseError",
  {
    cause: Schema.Unknown,
  }
) {}
