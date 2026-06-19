import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "./-api";

export class ApiClient extends Context.Service<ApiClient>()(
  "artifacts/api/client",
  {
    make: Effect.gen(function* make() {
      const httpApiClient = yield* HttpApiClient.make(Api, {
        baseUrl: window.location.origin,
      });
      return httpApiClient;
    }),
  }
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(FetchHttpClient.layer)
  );
}
