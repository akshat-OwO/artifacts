import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import * as Layer from "effect/Layer";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";

import { PreviewApiHandler } from "./handlers/preview-handlers";
import { SystemApiHandler } from "./handlers/system-handlers";
import { ApiKeyAuthLive } from "./middlewares/api-key-auth";
import { Api } from "./routes";
import { BrowserLive } from "./services/browser";
import { PreviewLockLive } from "./services/preview-lock";

const ApiLive = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json",
}).pipe(
  Layer.provide(SystemApiHandler),
  Layer.provide(PreviewApiHandler),
  Layer.provide(ApiKeyAuthLive)
);

const DocsLive = HttpApiScalar.layer(Api, { path: "/docs" });

const AppLive = Layer.mergeAll(ApiLive, DocsLive);

const ServerLive = HttpRouter.serve(AppLive).pipe(
  Layer.provide(BunHttpServer.layer({ port: 8787 })),
  Layer.provide(BrowserLive),
  Layer.provide(PreviewLockLive)
);

Layer.launch(ServerLive).pipe(BunRuntime.runMain);
