import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import { ApiClient } from "#/routes/api/rpc/-client";

const getArtifactByIdHandler = Effect.fn("artifacts/queries/getById")(
  function* getArtifactByIdHandler(artifactId: string) {
    const apiClient = yield* ApiClient;
    return yield* apiClient.artifacts.getArtifactById({
      params: { artifactId },
    });
  }
);

export const getArtifactByIdOptions = (artifactId: string) =>
  queryOptions({
    queryFn: async () => {
      const program = getArtifactByIdHandler(artifactId).pipe(
        Effect.catchTags({
          ArtifactNotFoundError: () => Effect.fail("Artifact not found"),
          SchemaError: () => Effect.fail("Invalid artifact ID"),
          Unauthorized: () => Effect.fail("Unauthorized"),
        }),
        Effect.catchTag(
          ["EffectDrizzleQueryError", "HttpClientError", "SqlError"],
          () => Effect.fail("Something went wrong")
        ),
        Effect.provide(ApiClient.layer)
      );

      return await Effect.runPromise(program);
    },
    queryKey: ["artifacts", artifactId],
  });
