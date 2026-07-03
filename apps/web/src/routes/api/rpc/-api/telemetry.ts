import * as Schema from "effect/Schema";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { ANALYTICS_EVENTS } from "#/lib/analytics/events";

import { AuthMiddleware } from "../-middlewares/auth";

const CliTelemetryEvent = Schema.Literals([
  ANALYTICS_EVENTS.cliArtifactDeleted,
  ANALYTICS_EVENTS.cliArtifactFetched,
  ANALYTICS_EVENTS.cliArtifactListed,
  ANALYTICS_EVENTS.cliArtifactShared,
  ANALYTICS_EVENTS.cliArtifactUnshared,
  ANALYTICS_EVENTS.cliArtifactUpdated,
  ANALYTICS_EVENTS.cliArtifactUploaded,
]);

export class TelemetryApi extends HttpApiGroup.make("telemetry")
  .add(
    HttpApiEndpoint.post("captureCliEvent", "/telemetry/cli-events", {
      payload: Schema.Struct({
        event: CliTelemetryEvent,
        properties: Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown)
        ),
      }),
      success: Schema.Struct({
        message: Schema.String,
      }),
    })
  )
  .middleware(AuthMiddleware) {}
