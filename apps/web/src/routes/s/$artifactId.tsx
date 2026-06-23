import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { ArtifactPreviewError } from "#/components/artifacts/artifact-preview-error";
import { ArtifactPreviewLoader } from "#/components/artifacts/artifact-preview-loader";
import { PublicArtifactPreview } from "#/components/artifacts/public-artifact-preview";
import { Navbar } from "#/components/navbar";
import { getPublicArtifactByIdOptions } from "#/lib/queries/artifacts/get-public-by-id";
import { artifactPageHead } from "#/lib/seo";

const RouteComponent = () => {
  const { artifactId } = Route.useParams();

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="border-primary mx-2 my-4 flex-1 rounded-md border md:mx-6">
        <Suspense fallback={<ArtifactPreviewLoader />}>
          <PublicArtifactPreview artifactId={artifactId} />
        </Suspense>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/s/$artifactId")({
  component: RouteComponent,
  errorComponent: ArtifactPreviewError,
  loader: async ({ context: { queryClient }, params: { artifactId } }) => {
    const artifact = await queryClient.ensureQueryData(
      getPublicArtifactByIdOptions(artifactId)
    );

    return { artifact };
  },
  head: ({ loaderData }) =>
    artifactPageHead({
      ...(loaderData?.artifact.author
        ? { author: loaderData.artifact.author }
        : {}),
      name: loaderData?.artifact.name ?? "Artifact",
      shared: true,
    }),
});
