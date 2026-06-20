import { PlugSocketIcon, Sad01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ArtifactPreviewErrorProps {
  error: unknown;
}

export const ArtifactPreviewError = ({ error }: ArtifactPreviewErrorProps) => {
  const message =
    typeof error === "string"
      ? error
      : "Something went wrong! Please try again.";

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <HugeiconsIcon
        icon={typeof error === "string" ? Sad01Icon : PlugSocketIcon}
        className="text-destructive size-20"
      />
      <p className="mt-4 text-lg text-center stroke-destructive-foreground">
        {message}
      </p>
    </div>
  );
};
