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
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
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
    <div className="flex flex-col">
      <p className="line-clamp-1 font-semibold">{data.name}</p>
      <p className="text-muted-foreground line-clamp-1 text-sm">
        {timestampLabel}{" "}
        {formatDistanceToNow(latestTimestamp, { addSuffix: true })}
      </p>
    </div>
  );
};
