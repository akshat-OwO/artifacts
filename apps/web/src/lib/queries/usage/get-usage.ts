import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import { ApiClient } from "#/routes/api/rpc/-client";

const getUsageHandler = Effect.fn("usage/queries/getUsage")(
  function* handler() {
    const apiClient = yield* ApiClient;
    return yield* apiClient.usage.getUsage();
  }
);

export const getUsageOptions = () =>
  queryOptions({
    queryFn: async () => {
      const program = getUsageHandler().pipe(Effect.provide(ApiClient.layer));
      return await Effect.runPromise(program);
    },
    queryKey: ["usage"],
  });
