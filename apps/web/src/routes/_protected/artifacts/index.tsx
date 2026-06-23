import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactsGrid } from "#/components/artifacts/artifacts-grid";
import { getAllArtifactsOptions } from "#/lib/queries/artifacts/get-all";
import { ARTIFACTS_PAGE_TITLE, createPageHead } from "#/lib/seo";

const RouteComponent = () => (
  <div className="h-full">
    <Suspense fallback={"Loading..."}>
      <ArtifactsGrid />
    </Suspense>
  </div>
);

export const Route = createFileRoute("/_protected/artifacts/")({
  component: RouteComponent,
  head: () =>
    createPageHead({
      description: "Browse and manage your uploaded HTML artifacts.",
      title: ARTIFACTS_PAGE_TITLE,
    }),
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getAllArtifactsOptions());
  },
});
