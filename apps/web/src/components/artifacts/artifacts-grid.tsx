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
    <div className="grid grid-cols-1 gap-10 p-4 md:grid-cols-3 lg:grid-cols-4">
      {data.map((artifact) => (
        <Link
          key={artifact.id}
          to="/a/$artifactId"
          params={{ artifactId: artifact.id }}
          className="border-accent bg-accent group relative rounded-md border"
        >
          <div className="absolute bottom-0 left-0 flex w-full flex-col gap-1 p-4">
            <p className="text-primary-foreground font-semibold">
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
          <div className="to-background/30 absolute bottom-0 h-1/4 w-full bg-linear-to-b from-transparent transition-all group-hover:h-1/2" />
          <img
            src={artifact.previewKey}
            alt={`${artifact.name} preview`}
            className="aspect-video rounded-md"
          />
        </Link>
      ))}
    </div>
  );
};
