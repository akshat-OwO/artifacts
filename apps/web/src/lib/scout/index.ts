import "@tanstack/react-start/server-only";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";

const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";
const SCOUT_SCHEDULE_TIMEOUT = "10 seconds";

const makeScoutApiService = Effect.gen(function* makeScoutApiService() {
  const apiKey = yield* Config.redacted("SCOUT_API_KEY");
  const baseUrl = yield* Config.string("SCOUT_BASE_URL");
  const serverBaseUrl = yield* Config.string("VITE_BASE_URL").pipe(
    Config.withDefault(DEFAULT_LOCAL_BASE_URL)
  );

  const httpClient = yield* HttpClient.HttpClient;

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
    const previewUrl = new URL("/preview", baseUrl).toString();

    return HttpClientRequest.post(previewUrl).pipe(
      HttpClientRequest.setHeader("X-API-KEY", Redacted.value(apiKey)),
      HttpClientRequest.bodyJsonUnsafe({ url, webhookUrl }),
      httpClient.execute,
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.asVoid,
      Effect.timeout(SCOUT_SCHEDULE_TIMEOUT)
    );
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
