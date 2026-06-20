import { HttpApi } from "effect/unstable/httpapi";

import { PreviewApi } from "./preview";
import { SystemApi } from "./system";

export class Api extends HttpApi.make("api").add(SystemApi).add(PreviewApi) {}
