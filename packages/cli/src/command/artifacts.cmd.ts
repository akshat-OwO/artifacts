import { formatDistanceToNow } from "date-fns";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Argument from "effect/unstable/cli/Argument";
import * as CliError from "effect/unstable/cli/CliError";
import * as Command from "effect/unstable/cli/Command";
import * as Flag from "effect/unstable/cli/Flag";
import * as Prompt from "effect/unstable/cli/Prompt";

import { infoMessage, style, successMessage } from "../lib/cli-output";
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
    style.muted(
      `${pad("id", 36)}  ${pad("name", nameWidth)}  ${pad(
        "created",
        createdWidth
      )}  ${pad("updated", updatedWidth)}`
    ),
  ];

  for (const row of rows) {
    lines.push(
      `${style.code(pad(row.id, 36))}  ${pad(row.name, nameWidth)}  ${pad(
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
      yield* Console.log(infoMessage("No artifacts found."));
      return;
    }

    yield* Console.log(
      style.heading(
        `Artifacts (${artifacts.length} ${artifacts.length === 1 ? "item" : "items"})`
      )
    );
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

    yield* Console.log(style.link(apiClient.artifactUrl(artifact.id)));
  })
).pipe(Command.withDescription("Get an artifact URL"));

export const deleteArtifactCommand = Command.make(
  "delete",
  {
    id: Argument.string("id").pipe(Argument.withDescription("The artifact id")),
    no: Flag.boolean("no").pipe(
      Flag.withAlias("n"),
      Flag.withDescription("Cancel without prompting")
    ),
    yes: Flag.boolean("yes").pipe(
      Flag.withAlias("y"),
      Flag.withDescription("Delete without prompting")
    ),
  },
  Effect.fnUntraced(function* handler({ id, no, yes }) {
    if (yes && no) {
      return yield* new CliError.ShowHelp({
        commandPath: ["artifacts", "delete"],
        errors: [
          new CliError.InvalidValue({
            expected: "pass only one of --yes or --no",
            kind: "flag",
            option: "yes",
            value: "true",
          }),
        ],
      });
    }

    const shouldDelete =
      yes ||
      (!no &&
        (yield* Prompt.select({
          choices: [
            { title: "Yes", value: true },
            { title: "No", value: false },
          ],
          message: `Delete artifact ${id}?`,
        })));

    if (!shouldDelete) {
      yield* Console.log(infoMessage("Delete cancelled."));
      return;
    }

    const apiClient = yield* ApiClient;
    yield* apiClient.deleteArtifact(id);
    yield* Console.log(successMessage("Artifact deleted."));
  })
).pipe(Command.withDescription("Delete an artifact"));

export const updateArtifactCommand = Command.make(
  "update",
  {
    id: Argument.string("id").pipe(Argument.withDescription("The artifact id")),
    name: Flag.string("name").pipe(
      Flag.withDescription("The new artifact name"),
      Flag.optional
    ),
    path: Flag.path("path", { mustExist: true, pathType: "file" }).pipe(
      Flag.withDescription("The HTML file path to replace the artifact with"),
      Flag.optional
    ),
  },
  Effect.fnUntraced(function* handler(
    { id, name, path },
    commandPath?: readonly string[]
  ) {
    const filePath = Option.getOrUndefined(path);
    const artifactName = Option.getOrUndefined(name);

    if (!filePath && !artifactName) {
      return yield* new CliError.ShowHelp({
        commandPath: [...(commandPath ?? ["artifacts", "update"])],
        errors: [
          new CliError.InvalidValue({
            expected: "pass --path, --name, or both",
            kind: "flag",
            option: "path",
            value: "",
          }),
        ],
      });
    }

    const apiClient = yield* ApiClient;
    const artifact = yield* apiClient.updateArtifact(id, {
      name: artifactName,
      path: filePath,
    });

    yield* Console.log(successMessage("Artifact updated."));
    yield* Console.log(style.link(apiClient.artifactUrl(artifact.id)));
  })
).pipe(Command.withDescription("Update an artifact"));
