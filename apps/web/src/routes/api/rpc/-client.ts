import { createIsomorphicFn } from "@tanstack/react-start";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "./-api";

const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";

const getForwardedRequestHeaders = createIsomorphicFn()
  .client((): Promise<Record<string, string>> => Promise.resolve({}))
  .server(async () => {
    const { getRequestHeaders } = await import("@tanstack/react-start/server");
    return Object.fromEntries(getRequestHeaders());
  });

const getRequestBaseUrl = createIsomorphicFn()
  .client(
    (): Promise<string> =>
      Promise.resolve(import.meta.env.VITE_BASE_URL ?? window.location.origin)
  )
  .server(
    (): Promise<string> =>
      Promise.resolve(
        process.env.SERVER_BASE_URL ??
          process.env.VITE_BASE_URL ??
          DEFAULT_LOCAL_BASE_URL
      )
  );

export class ApiClient extends Context.Service<ApiClient>()(
  "artifacts/api/client",
  {
    make: Effect.gen(function* make() {
      const baseUrl = yield* Effect.promise(getRequestBaseUrl);
      const httpApiClient = yield* HttpApiClient.make(Api, {
        baseUrl,
        transformClient: HttpClient.mapRequestEffect((request) =>
          Effect.promise(getForwardedRequestHeaders).pipe(
            Effect.map((headers) =>
              HttpClientRequest.setHeaders(request, headers)
            )
          )
        ),
      });
      return httpApiClient;
    }),
  }
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(FetchHttpClient.layer)
  );
}
