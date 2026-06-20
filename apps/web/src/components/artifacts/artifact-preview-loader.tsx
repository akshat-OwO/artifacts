import { Logo } from "../logo";

interface ArtifactPreviewLoaderProps {
  text?: string;
}

export const ArtifactPreviewLoader = ({
  text = "Loading...",
}: ArtifactPreviewLoaderProps) => (
  <div className="h-full flex flex-col items-center justify-center">
    <Logo variant="loader" />
    <p className="text-muted-foreground font-semibold mt-4">{text}</p>
  </div>
);
