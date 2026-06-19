import { HttpApi } from "effect/unstable/httpapi";

import { SystemApi } from "./system";
import { UploadApi } from "./upload";

export class Api extends HttpApi.make("api")
  .add(SystemApi)
  .add(UploadApi)
  .prefix("/api/rpc") {}
