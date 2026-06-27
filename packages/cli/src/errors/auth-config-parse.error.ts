import * as Schema from "effect/Schema";

export class AuthConfigParseError extends Schema.TaggedErrorClass<AuthConfigParseError>()(
  "AuthConfigParseError",
  {
    cause: Schema.Unknown,
  }
) {}
