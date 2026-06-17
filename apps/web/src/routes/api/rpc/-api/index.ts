import { HttpApi } from "effect/unstable/httpapi";

import { SystemApi } from "./system";

export class Api extends HttpApi.make("api")
  .add(SystemApi)
  .prefix("/api/rpc") {}
