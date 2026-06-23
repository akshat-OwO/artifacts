import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { getArtifactByIdOptions } from "#/lib/queries/artifacts/get-by-id";
import { getPublicArtifactByIdOptions } from "#/lib/queries/artifacts/get-public-by-id";

import { Skeleton } from "../ui/skeleton";

interface ArtifactNavbarProps {
  artifactId: string;
  visibility?: "owner" | "public";
}

export const ArtifactNavbar = ({
  artifactId,
  visibility = "owner",
}: ArtifactNavbarProps) => {
  const ownerQuery = useQuery({
    ...getArtifactByIdOptions(artifactId),
    enabled: visibility === "owner",
  });
  const publicQuery = useQuery({
    ...getPublicArtifactByIdOptions(artifactId),
    enabled: visibility === "public",
  });
  const { data, isLoading } =
    visibility === "public" ? publicQuery : ownerQuery;

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
