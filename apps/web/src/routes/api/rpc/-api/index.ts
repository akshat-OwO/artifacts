import { HttpApi } from "effect/unstable/httpapi";

import { ArtifactsApi } from "./artifacts";
import { PreviewWebhookApi } from "./preview-webhook";
import { PublicArtifactsApi } from "./public-artifacts";
import { SystemApi } from "./system";
import { UploadApi } from "./upload";
import { UsageApi } from "./usage";

export class Api extends HttpApi.make("api")
  .add(SystemApi)
  .add(PublicArtifactsApi)
  .add(PreviewWebhookApi)
  .add(UploadApi)
  .add(ArtifactsApi)
  .add(UsageApi)
  .prefix("/api/rpc") {}
