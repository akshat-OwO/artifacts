import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactsGrid } from "#/components/artifacts/artifacts-grid";
import { getAllArtifactsOptions } from "#/lib/queries/artifacts/get-all";

const RouteComponent = () => (
  <Suspense fallback={"Loading..."}>
    <ArtifactsGrid />
  </Suspense>
);

export const Route = createFileRoute("/_protected/artifacts/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getAllArtifactsOptions());
  },
});
