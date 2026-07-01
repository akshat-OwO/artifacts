import * as Layer from "effect/Layer";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";

import { Api } from "./-api";
import { ArtifactsApiHandler } from "./-handlers/artifacts";
import { PreviewWebhookApiHandler } from "./-handlers/preview-webhook";
import { PublicArtifactsApiHandler } from "./-handlers/public-artifacts";
import { SystemApiHandler } from "./-handlers/system";
import { UploadApiHandler } from "./-handlers/upload";
import { UsageApiHandler } from "./-handlers/usage";
import { AuthLive } from "./-middlewares/auth.server";
import { ScoutApiKeyLive } from "./-middlewares/scout-api-key";

const ApiLive = HttpApiBuilder.layer(Api, {
  openapiPath: "/api/rpc/openapi.json",
}).pipe(
  Layer.provide(SystemApiHandler),
  Layer.provide(PublicArtifactsApiHandler),
  Layer.provide(PreviewWebhookApiHandler),
  Layer.provide(UploadApiHandler),
  Layer.provide(ArtifactsApiHandler),
  Layer.provide(UsageApiHandler),
  Layer.provide(AuthLive),
  Layer.provide(ScoutApiKeyLive)
);

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
