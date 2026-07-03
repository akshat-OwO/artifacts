import * as Effect from "effect/Effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { captureServerEvent } from "#/lib/analytics/server";
import { AuthUser } from "#/lib/auth/context";

import { Api } from "../-api";

export const TelemetryApiHandler = HttpApiBuilder.group(
  Api,
  "telemetry",
  (handlers) =>
    handlers.handle(
      "captureCliEvent",
      ({ payload: { event, properties = {} } }) =>
        Effect.gen(function* handler() {
          const user = yield* AuthUser;

          yield* captureServerEvent({
            distinctId: user.id,
            event,
            properties: {
              ...properties,
              source: "cli",
            },
          });

          return { message: "Telemetry captured." };
        })
    )
);
