import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import { getAllArtifactsOptions } from "#/lib/queries/artifacts/get-all";

export const ArtifactsGrid = () => {
  const { data } = useSuspenseQuery(getAllArtifactsOptions());

  if (!data) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 p-4">
      {data.map((artifact) => (
        <Link
          key={artifact.id}
          to="/a/$artifactId"
          params={{ artifactId: artifact.id }}
          className="rounded-md border border-accent bg-accent relative group"
        >
          <div className="absolute bottom-0 left-0 w-full flex flex-col gap-1 p-4">
            <p className="font-semibold text-primary-foreground">
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
          <div className="transition-all absolute bottom-0 w-full h-1/4 group-hover:h-1/2 bg-linear-to-b from-transparent to-background/30" />
          <img
            src={artifact.previewKey}
            alt={`${artifact.name} preview`}
            className="rounded-md aspect-video"
          />
        </Link>
      ))}
    </div>
  );
};
