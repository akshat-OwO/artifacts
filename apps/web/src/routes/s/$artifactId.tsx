import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactPreviewError } from "#/components/artifacts/artifact-preview-error";
import { ArtifactPreviewLoader } from "#/components/artifacts/artifact-preview-loader";
import { PublicArtifactPreview } from "#/components/artifacts/public-artifact-preview";
import { Navbar } from "#/components/navbar";
import { ScrollArea } from "#/components/ui/scroll-area";
import { getPublicArtifactByIdOptions } from "#/lib/queries/artifacts/get-public-by-id";
import { artifactPageHead } from "#/lib/seo";

interface PublicArtifactRouteHeadData {
  artifact?: {
    author?: string | null;
    name: string;
    previewImageUrl?: string | null;
  };
}

const RouteComponent = () => {
  const { artifactId } = Route.useParams();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar />
      <div className="border-primary bg-background mx-2 my-4 min-h-0 flex-1 overflow-hidden rounded-md border md:mx-6">
        <ScrollArea fill>
          <Suspense fallback={<ArtifactPreviewLoader />}>
            <PublicArtifactPreview artifactId={artifactId} />
          </Suspense>
        </ScrollArea>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/s/$artifactId")({
  component: RouteComponent,
  errorComponent: ArtifactPreviewError,
  head: ({
    loaderData,
  }: {
    loaderData?: PublicArtifactRouteHeadData | undefined;
  }) =>
    artifactPageHead({
      ...(loaderData?.artifact?.author
        ? { author: loaderData.artifact.author }
        : {}),
      ...(loaderData?.artifact?.previewImageUrl
        ? { image: loaderData.artifact.previewImageUrl }
        : {}),
      name: loaderData?.artifact?.name ?? "Artifact",
      shared: true,
    }),
  loader: async ({ context: { queryClient }, params: { artifactId } }) => {
    const artifact = await queryClient.ensureQueryData(
      getPublicArtifactByIdOptions(artifactId)
    );

    return { artifact };
  },
});
