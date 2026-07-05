import * as Effect from "effect/Effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { ANALYTICS_EVENTS } from "#/lib/analytics/events";
import { captureServerEvent, getAnalyticsUrl } from "#/lib/analytics/server";
import { AuthUser } from "#/lib/auth/context";

import { Api } from "../-api";

const getCliEventPath = (
  event: string,
  artifactId: unknown
): string | undefined => {
  if (event === ANALYTICS_EVENTS.cliArtifactListed) {
    return "/artifacts";
  }

  if (typeof artifactId !== "string") {
    return;
  }

  if (event === ANALYTICS_EVENTS.cliArtifactShared) {
    return `/s/${artifactId}`;
  }

  return `/a/${artifactId}`;
};

export const TelemetryApiHandler = HttpApiBuilder.group(
  Api,
  "telemetry",
  (handlers) =>
    handlers.handle(
      "captureCliEvent",
      ({ payload: { event, properties = {} } }) =>
        Effect.gen(function* handler() {
          const user = yield* AuthUser;
          const path = getCliEventPath(event, properties.artifact_id);

          yield* captureServerEvent({
            distinctId: user.id,
            event,
            properties: {
              ...(path ? { $current_url: getAnalyticsUrl(path), path } : {}),
              ...properties,
              source: "cli",
            },
          });

          return { message: "Telemetry captured." };
        })
    )
);
