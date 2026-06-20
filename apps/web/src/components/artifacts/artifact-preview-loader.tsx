import { Logo } from "../logo";

interface ArtifactPreviewLoaderProps {
  text?: string;
}

export const ArtifactPreviewLoader = ({
  text = "Loading...",
}: ArtifactPreviewLoaderProps) => (
  <div className="flex h-full flex-col items-center justify-center">
    <Logo variant="loader" />
    <p className="text-muted-foreground mt-4 font-semibold">{text}</p>
  </div>
);
