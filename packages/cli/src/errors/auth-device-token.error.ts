import * as Schema from "effect/Schema";

export class AuthDeviceTokenError extends Schema.TaggedErrorClass<AuthDeviceTokenError>()(
  "AuthDeviceTokenError",
  {
    description: Schema.String,
    type: Schema.Union([
      Schema.Literal("invalid_request"),
      Schema.Literal("authorization_pending"),
      Schema.Literal("slow_down"),
      Schema.Literal("expired_token"),
      Schema.Literal("access_denied"),
      Schema.Literal("invalid_grant"),
    ]),
  }
) {}
