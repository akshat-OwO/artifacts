import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import { ApiClient } from "#/routes/api/rpc/-client";

const getPublicArtifactPreviewByKeyHandler = Effect.fn(
  "artifacts/queries/getPublicPreviewByKey"
)(function* handler(artifactKey: string) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.publicArtifacts.getPublicArtifactPreviewByKey({
    params: { artifactKey },
  });
});

export const getPublicArtifactPreviewByKeyOptions = (
  artifactId: string,
  artifactKey: string
) =>
  queryOptions({
    queryFn: async () => {
      const program = getPublicArtifactPreviewByKeyHandler(artifactKey).pipe(
        Effect.provide(ApiClient.layer)
      );
      return await Effect.runPromise(program);
    },
    queryKey: ["public-artifacts", artifactId, artifactKey],
    staleTime: Infinity,
  });
