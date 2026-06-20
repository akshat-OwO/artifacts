import { useQuery } from "@tanstack/react-query";

import { getArtifactPreviewByKeyOptions } from "#/lib/queries/artifacts/get-preview-by-key";

import { ArtifactPreviewError } from "./artifact-preview-error";
import { ArtifactPreviewLoader } from "./artifact-preview-loader";

interface ArtifactFrameProps {
  artifactId: string;
  artifactKey: string;
  title: string;
}

export const ArtifactFrame = ({
  artifactId,
  artifactKey,
  title,
}: ArtifactFrameProps) => {
  const {
    data: url,
    error,
    isLoading,
  } = useQuery(getArtifactPreviewByKeyOptions(artifactId, artifactKey));

  if (isLoading) {
    return <ArtifactPreviewLoader text="Loading artifact..." />;
  }

  if (error) {
    return <ArtifactPreviewError error={error} />;
  }

  return (
    <iframe
      allow=""
      className="rounded-md w-full h-full"
      referrerPolicy="no-referrer"
      sandbox="allow-scripts"
      src={url}
      title={title}
    />
  );
};
