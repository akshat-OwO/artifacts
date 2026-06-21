import { ArchiveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { ArtifactCard } from "#/components/artifacts/artifact-card";
import { Button } from "#/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { getAllArtifactsOptions } from "#/lib/queries/artifacts/get-all";

export const ArtifactsGrid = () => {
  const { data } = useSuspenseQuery(getAllArtifactsOptions());

  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ArchiveIcon} />
          </EmptyMedia>
          <EmptyTitle>No artifacts yet</EmptyTitle>
          <EmptyDescription>
            Upload an HTML file to create your first artifact.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link to="/" />}>Create artifact</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 p-4 md:grid-cols-3 lg:grid-cols-4">
      {data.map((artifact) => (
        <ArtifactCard key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
};
