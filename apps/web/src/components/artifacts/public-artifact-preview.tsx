import { useSuspenseQuery } from "@tanstack/react-query";

import { getPublicArtifactByIdOptions } from "#/lib/queries/artifacts/get-public-by-id";

import { ArtifactFrame } from "./artifact-frame";

interface PublicArtifactPreviewProps {
  artifactId: string;
}

export const PublicArtifactPreview = ({
  artifactId,
}: PublicArtifactPreviewProps) => {
  const { data } = useSuspenseQuery(getPublicArtifactByIdOptions(artifactId));

  return (
    <ArtifactFrame
      artifactId={data.id}
      artifactKey={data.artifactKey}
      title={data.name}
      visibility="public"
    />
  );
};
