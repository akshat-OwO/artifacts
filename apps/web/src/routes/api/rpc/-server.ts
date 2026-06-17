import * as Layer from "effect/Layer";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";

import { Api } from "./-api";
import { SystemApiHandler } from "./-handlers/system";

const ApiLive = HttpApiBuilder.layer(Api, {
  openapiPath: "/api/rpc/openapi.json",
}).pipe(Layer.provide(SystemApiHandler));

const DocsLive = HttpApiScalar.layer(Api, {
  path: "/api/rpc/docs",
});

const { handler: rpcHandler } = HttpRouter.toWebHandler(
  Layer.provideMerge(
    Layer.mergeAll(ApiLive, DocsLive),
    HttpServer.layerServices
  )
);

export { rpcHandler };
