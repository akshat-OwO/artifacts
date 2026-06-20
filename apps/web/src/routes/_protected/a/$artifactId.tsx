import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactPreview } from "#/components/artifacts/artifact-preview";
import { ArtifactPreviewError } from "#/components/artifacts/artifact-preview-error";
import { ArtifactPreviewLoader } from "#/components/artifacts/artifact-preview-loader";
import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";

const RouteComponent = () => {
  const { artifactId } = Route.useParams();

  return (
    <div className="h-full">
      <Suspense fallback={<ArtifactPreviewLoader />}>
        <ArtifactPreview artifactId={artifactId} />
      </Suspense>
    </div>
  );
};

export const Route = createFileRoute("/_protected/a/$artifactId")({
  component: RouteComponent,
  errorComponent: ArtifactPreviewError,
  loader: async ({ context: { queryClient }, params: { artifactId } }) => {
    await queryClient.ensureQueryData(getArtifactByIdOptions(artifactId));
  },
});
