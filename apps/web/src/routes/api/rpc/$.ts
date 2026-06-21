import { createFileRoute } from "@tanstack/react-router";
import * as Context from "effect/Context";

import { rpcHandler } from "./-server";

const handle = ({ request }: { request: Request }) =>
  rpcHandler(request, Context.empty());

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      DELETE: handle,
      GET: handle,
      HEAD: handle,
      OPTIONS: handle,
      PATCH: handle,
      POST: handle,
      PUT: handle,
    },
  },
});
