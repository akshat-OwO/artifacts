import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";

import { Skeleton } from "../ui/skeleton";

interface ArtifactNavbarProps {
  artifactId: string;
}

export const ArtifactNavbar = ({ artifactId }: ArtifactNavbarProps) => {
  const { data, isLoading } = useQuery(getArtifactByIdOptions(artifactId));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="w-36 h-4" />
        <Skeleton className="w-24 h-4" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const wasUpdated = data.updatedAt.getTime() > data.createdAt.getTime();
  const latestTimestamp = wasUpdated ? data.updatedAt : data.createdAt;
  const timestampLabel = wasUpdated ? "Updated" : "Created";

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">
        {data.name}{" "}
        <span className="inline-block text-muted-foreground">
          by {data.author}
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        {timestampLabel}{" "}
        {formatDistanceToNow(latestTimestamp, { addSuffix: true })}
      </p>
    </div>
  );
};
