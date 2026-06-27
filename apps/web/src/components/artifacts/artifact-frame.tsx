import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { getArtifactPreviewByKeyOptions } from "#/lib/queries/artifacts/get-preview-by-key";
import { getPublicArtifactPreviewByKeyOptions } from "#/lib/queries/artifacts/get-public-preview-by-key";

import { ArtifactPreviewError } from "./artifact-preview-error";
import { ArtifactPreviewLoader } from "./artifact-preview-loader";

interface ArtifactFrameProps {
  artifactId: string;
  artifactKey: string;
  title: string;
  visibility?: "owner" | "public";
}

export const ArtifactFrame = ({
  artifactId,
  artifactKey,
  title,
  visibility = "owner",
}: ArtifactFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewOptions =
    visibility === "public"
      ? getPublicArtifactPreviewByKeyOptions(artifactId, artifactKey)
      : getArtifactPreviewByKeyOptions(artifactId, artifactKey);
  const { data: url, error, isLoading } = useQuery(previewOptions);

  useEffect(() => {
    if (!url) {
      return;
    }

    iframeRef.current?.contentWindow?.location.replace(url);
  }, [url]);

  if (isLoading) {
    return <ArtifactPreviewLoader text="Loading artifact..." />;
  }

  if (error) {
    return <ArtifactPreviewError error={error} />;
  }

  return (
    <iframe
      allow=""
      className="h-full w-full rounded-md"
      ref={iframeRef}
      referrerPolicy="no-referrer"
      sandbox="allow-scripts"
      src="about:blank"
      title={title}
    />
  );
};
