import { useSuspenseQuery } from "@tanstack/react-query";

import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";

import { ArtifactFrame } from "./artifact-frame";

interface ArtifactPreviewProps {
  artifactId: string;
}

export const ArtifactPreview = ({ artifactId }: ArtifactPreviewProps) => {
  const { data } = useSuspenseQuery(getArtifactByIdOptions(artifactId));

  return (
    <ArtifactFrame
      artifactId={data.id}
      artifactKey={data.artifactKey}
      title={data.name}
    />
  );
};
