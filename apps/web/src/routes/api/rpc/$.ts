import { createFileRoute } from "@tanstack/react-router";

import { rpcHandler } from "./-server";

const handle = ({ request }: { request: Request }) => rpcHandler(request);

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
