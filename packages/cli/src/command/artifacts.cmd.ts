import { formatDistanceToNow } from "date-fns";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Argument from "effect/unstable/cli/Argument";
import * as Command from "effect/unstable/cli/Command";

import { ApiClient } from "../services/api-client";

interface ArtifactListItem {
  readonly createdAt: Date;
  readonly id: string;
  readonly name: string;
  readonly updatedAt: Date;
}

const formatRelativeDate = (date: Date): string =>
  `${formatDistanceToNow(date)} ago`;

const pad = (value: string, width: number): string => value.padEnd(width);

const formatArtifactsTable = (
  artifacts: readonly ArtifactListItem[]
): string => {
  const rows = artifacts.map((artifact) => ({
    created: formatRelativeDate(artifact.createdAt),
    id: artifact.id,
    name: artifact.name,
    updated: formatRelativeDate(artifact.updatedAt),
  }));

  const nameWidth = Math.max(
    "name".length,
    ...rows.map((row) => row.name.length)
  );
  const createdWidth = Math.max(
    "created".length,
    ...rows.map((row) => row.created.length)
  );
  const updatedWidth = Math.max(
    "updated".length,
    ...rows.map((row) => row.updated.length)
  );

  const lines = [
    `${pad("id", 36)}  ${pad("name", nameWidth)}  ${pad(
      "created",
      createdWidth
    )}  ${pad("updated", updatedWidth)}`,
  ];

  for (const row of rows) {
    lines.push(
      `${pad(row.id, 36)}  ${pad(row.name, nameWidth)}  ${pad(
        row.created,
        createdWidth
      )}  ${pad(row.updated, updatedWidth)}`
    );
  }

  return lines.join("\n");
};

export const listArtifactsCommand = Command.make(
  "ls",
  {},
  Effect.fnUntraced(function* handler() {
    const apiClient = yield* ApiClient;
    const artifacts = yield* apiClient.getArtifacts();

    if (artifacts.length === 0) {
      yield* Console.log("No artifacts found.");
      return;
    }

    yield* Console.log(formatArtifactsTable(artifacts));
  })
).pipe(Command.withDescription("List artifacts"));

export const getArtifactCommand = Command.make(
  "get",
  {
    id: Argument.string("id").pipe(Argument.withDescription("The artifact id")),
  },
  Effect.fnUntraced(function* handler({ id }) {
    const apiClient = yield* ApiClient;
    const artifact = yield* apiClient.getArtifact(id);

    yield* Console.log(apiClient.artifactUrl(artifact.id));
  })
).pipe(Command.withDescription("Get an artifact URL"));
