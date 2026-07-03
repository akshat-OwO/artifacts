import { HttpApi } from "effect/unstable/httpapi";

import { ArtifactsApi } from "./artifacts";
import { PublicArtifactsApi } from "./public-artifacts";
import { SystemApi } from "./system";
import { TelemetryApi } from "./telemetry";
import { UploadApi } from "./upload";
import { UsageApi } from "./usage";

export class Api extends HttpApi.make("api")
  .add(SystemApi)
  .add(PublicArtifactsApi)
  .add(UploadApi)
  .add(ArtifactsApi)
  .add(UsageApi)
  .add(TelemetryApi)
  .prefix("/api/rpc") {}
