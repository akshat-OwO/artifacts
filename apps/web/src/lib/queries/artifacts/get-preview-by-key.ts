import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import { ApiClient } from "#/routes/api/rpc/-client";

const getArtifactPreviewByKeyHandler = Effect.fn(
  "artifacts/queries/getPreviewByKey"
)(function* handler(artifactKey: string) {
  const apiClient = yield* ApiClient;
  return yield* apiClient.artifacts.getArtifactPreviewByKey({
    params: { artifactKey },
  });
});

export const getArtifactPreviewByKeyOptions = (
  artifactId: string,
  artifactKey: string
) =>
  queryOptions({
    queryFn: async () => {
      const program = getArtifactPreviewByKeyHandler(artifactKey).pipe(
        Effect.provide(ApiClient.layer)
      );
      return await Effect.runPromise(program);
    },
    queryKey: ["artifacts", artifactId, artifactKey],
  });
