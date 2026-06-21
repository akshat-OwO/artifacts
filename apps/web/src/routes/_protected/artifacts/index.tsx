import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactsGrid } from "#/components/artifacts/artifacts-grid";
import { getAllArtifactsOptions } from "#/lib/queries/artifacts/get-all";

const RouteComponent = () => (
  <div className="h-full">
    <Suspense fallback={"Loading..."}>
      <ArtifactsGrid />
    </Suspense>
  </div>
);

export const Route = createFileRoute("/_protected/artifacts/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getAllArtifactsOptions());
  },
});
