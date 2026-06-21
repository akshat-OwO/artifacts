import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { ReactElement } from "react";

import { detectImageLuminance } from "#/lib/utils";

export interface ArtifactCardProps {
  artifact: {
    id: string;
    name: string;
    previewKey: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const ArtifactCard = ({ artifact }: ArtifactCardProps): ReactElement => {
  const [appearance, setAppearance] = useState<"dark" | "light">("light");

  return (
    <Link
      to="/a/$artifactId"
      params={{ artifactId: artifact.id }}
      className="border-accent bg-accent group relative overflow-hidden rounded-md border"
    >
      <div className="absolute bottom-0 left-0 z-10 flex w-full flex-col gap-1 p-4">
        <p
          className={`${appearance === "dark" ? "text-primary-foreground dark:text-primary" : "text-primary dark:text-primary-foreground"} font-semibold`}
        >
          {artifact.name}
        </p>
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(
            artifact.updatedAt.getTime() > artifact.createdAt.getTime()
              ? artifact.updatedAt
              : artifact.createdAt,
            { addSuffix: true }
          )}
        </span>
      </div>
      <img
        src={artifact.previewKey}
        alt={`${artifact.name} preview`}
        crossOrigin="anonymous"
        className="aspect-video h-full w-full rounded-md transition-all group-hover:scale-[1.03]"
        onLoad={(event) => {
          setAppearance(detectImageLuminance(event.currentTarget));
        }}
      />
    </Link>
  );
};
