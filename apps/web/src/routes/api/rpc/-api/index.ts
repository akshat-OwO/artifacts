import { HttpApi } from "effect/unstable/httpapi";

import { ArtifactsApi } from "./artifacts";
import { SystemApi } from "./system";
import { UploadApi } from "./upload";

export class Api extends HttpApi.make("api")
  .add(SystemApi)
  .add(UploadApi)
  .add(ArtifactsApi)
  .prefix("/api/rpc") {}
