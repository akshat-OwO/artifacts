import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi";

import { UnauthorizedError } from "../errors/unauthorized-error";

export class ApiKeyAuth extends HttpApiMiddleware.Service<ApiKeyAuth>()(
  "@artifacts/scout/ApiKeyAuth",
  {
    error: UnauthorizedError,
    security: {
      apiKey: HttpApiSecurity.apiKey({
        in: "header",
        key: "X-API-KEY",
      }),
    },
  }
) {}

export const ApiKeyAuthLive = Layer.effect(
  ApiKeyAuth,
  Effect.gen(function* ApiKeyAuthLive() {
    const expectedApiKey = yield* Config.redacted("API_KEY");

    return {
      apiKey: (httpEffect, { credential }) =>
        Redacted.value(credential) === Redacted.value(expectedApiKey)
          ? httpEffect
          : Effect.fail(new UnauthorizedError()),
    };
  })
);
