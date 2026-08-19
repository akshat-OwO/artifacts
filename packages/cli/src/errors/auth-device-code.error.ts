import * as Schema from "effect/Schema";

export class AuthDeviceCodeError extends Schema.TaggedError<AuthDeviceCodeError>()(
  "AuthDeviceCodeError",
  {
    description: Schema.String,
    type: Schema.Union([
      Schema.Literal("invalid_request"),
      Schema.Literal("invalid_client"),
    ]),
  }
) {}
