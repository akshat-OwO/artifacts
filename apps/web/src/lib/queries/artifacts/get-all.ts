import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import { ApiClient } from "#/routes/api/rpc/-client";

const getAllArtifactsHandler = Effect.fn("artifacts/queries/getAllArtifacts")(
  function* handler() {
    const apiClient = yield* ApiClient;
    return yield* apiClient.artifacts.getArtifacts();
  }
);

export const getAllArtifactsOptions = () =>
  queryOptions({
    queryFn: async () => {
      const program = getAllArtifactsHandler().pipe(
        Effect.provide(ApiClient.layer)
      );
      return await Effect.runPromise(program);
    },
    queryKey: ["artifacts"],
  });
