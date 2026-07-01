import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi";

import { Unauthorized } from "#/lib/errors/unauthorized";

export class ScoutApiKeyMiddleware extends HttpApiMiddleware.Service<ScoutApiKeyMiddleware>()(
  "artifacts/api/middleware/scoutApiKey",
  {
    error: Unauthorized,
    security: {
      apiKey: HttpApiSecurity.apiKey({
        in: "header",
        key: "X-API-KEY",
      }),
    },
  }
) {}

export const ScoutApiKeyLive = Layer.effect(
  ScoutApiKeyMiddleware,
  Effect.gen(function* ScoutApiKeyLive() {
    const expectedApiKey = yield* Config.redacted("SCOUT_API_KEY");

    return {
      apiKey: (httpEffect, { credential }) =>
        Redacted.value(credential) === Redacted.value(expectedApiKey)
          ? httpEffect
          : Effect.fail(new Unauthorized()),
    };
  })
);
