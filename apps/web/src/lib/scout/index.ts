import "@tanstack/react-start/server-only";
import { Api as ScoutApi } from "@artifacts/scout/api";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";

const makeScoutApiService = Effect.gen(function* makeScoutApiService() {
  const apiKey = yield* Config.redacted("SCOUT_API_KEY");
  const baseUrl = yield* Config.string("SCOUT_BASE_URL");
  const serverBaseUrl = yield* Config.string("VITE_BASE_URL").pipe(
    Config.withDefault(DEFAULT_LOCAL_BASE_URL)
  );

  const client = yield* HttpApiClient.make(ScoutApi, {
    baseUrl,
    transformClient: (httpClient) =>
      httpClient.pipe(
        HttpClient.mapRequest(
          HttpClientRequest.setHeader("X-API-KEY", Redacted.value(apiKey))
        ),
        HttpClient.retryTransient({
          schedule: Schedule.exponential(100),
          times: 3,
        })
      ),
  });

  const scheduleCapture = Effect.fn("artifacts/scoutApi/scheduleCapture")(({
    artifactId,
    url,
    userId,
  }: {
    artifactId: string;
    url: string;
    userId: string;
  }) => {
    const webhookUrl = new URL(
      `/api/rpc/artifacts/${artifactId}/preview-webhook/${userId}`,
      serverBaseUrl
    ).toString();

    return client.preview.captureAsync({
      payload: { url, webhookUrl },
    });
  });

  return { scheduleCapture } as const;
});

export class ScoutApiService extends Context.Service<
  ScoutApiService,
  Effect.Success<typeof makeScoutApiService>
>()("artifacts/scoutApi") {}

export const ScoutApiLive = Layer.effect(
  ScoutApiService,
  makeScoutApiService
).pipe(Layer.provide(FetchHttpClient.layer));
