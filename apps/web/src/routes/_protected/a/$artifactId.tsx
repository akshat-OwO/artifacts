import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactPreview } from "#/components/artifacts/artifact-preview";
import { ArtifactPreviewError } from "#/components/artifacts/artifact-preview-error";
import { ArtifactPreviewLoader } from "#/components/artifacts/artifact-preview-loader";
import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";
import { artifactPageHead } from "#/lib/seo";

interface ArtifactRouteHeadData {
  artifact?: {
    name: string;
  };
}

const RouteComponent = () => {
  const { artifactId } = Route.useParams();

  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={<ArtifactPreviewLoader />}>
        <ArtifactPreview artifactId={artifactId} />
      </Suspense>
    </div>
  );
};

export const Route = createFileRoute("/_protected/a/$artifactId")({
  component: RouteComponent,
  errorComponent: ArtifactPreviewError,
  head: ({ loaderData }: { loaderData?: ArtifactRouteHeadData | undefined }) =>
    artifactPageHead({
      name: loaderData?.artifact?.name ?? "Artifact",
    }),
  loader: async ({ context: { queryClient }, params: { artifactId } }) => {
    const artifact = await queryClient.ensureQueryData(
      getArtifactByIdOptions(artifactId)
    );

    return { artifact };
  },
});
