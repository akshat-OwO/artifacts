import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import { ApiClient } from "#/routes/api/rpc/-client";

const getPublicArtifactByIdHandler = Effect.fn(
  "artifacts/queries/getPublicById"
)(function* getPublicArtifactByIdHandler(artifactId: string) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.publicArtifacts.getPublicArtifactById({
    params: { artifactId },
  });
});

export const getPublicArtifactByIdOptions = (artifactId: string) =>
  queryOptions({
    queryFn: async () => {
      const program = getPublicArtifactByIdHandler(artifactId).pipe(
        Effect.catchTags({
          ArtifactNotFoundError: () => Effect.fail("Artifact not found"),
          SchemaError: () => Effect.fail("Invalid artifact ID"),
        }),
        Effect.catchTag(
          ["EffectDrizzleQueryError", "HttpClientError", "SqlError"],
          () => Effect.fail("Something went wrong")
        ),
        Effect.provide(ApiClient.layer)
      );

      return await Effect.runPromise(program);
    },
    queryKey: ["public-artifacts", artifactId],
  });
