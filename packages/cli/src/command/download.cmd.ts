import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Option from "effect/Option";
import * as Terminal from "effect/Terminal";
import * as Argument from "effect/unstable/cli/Argument";
import * as Command from "effect/unstable/cli/Command";
import * as Flag from "effect/unstable/cli/Flag";

import { ANALYTICS_EVENTS } from "../../../../apps/web/src/lib/analytics/events";
import { ArtifactOutputWriteError } from "../errors/artifact-output-write.error";
import { ApiClient } from "../services/api-client";

interface ArtifactDownloadClient<E, R> {
  readonly downloadArtifact: (
    artifactId: string
  ) => Effect.Effect<string, E, R>;
}

export const downloadArtifactToOutput = <E, R>({
  apiClient,
  artifactId,
  outputPath,
}: {
  readonly apiClient: ArtifactDownloadClient<E, R>;
  readonly artifactId: string;
  readonly outputPath?: string;
}) =>
  Effect.gen(function* downloadArtifactToOutputEffect() {
    const html = yield* apiClient.downloadArtifact(artifactId);

    if (outputPath) {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.writeFileString(outputPath, html).pipe(
        Effect.mapError(
          (cause) =>
            new ArtifactOutputWriteError({
              cause,
              path: outputPath,
            })
        )
      );
      return;
    }

    const terminal = yield* Terminal.Terminal;
    yield* terminal.display(html);
  });

export const downloadArtifactCommand = Command.make(
  "download",
  {
    id: Argument.string("id").pipe(Argument.withDescription("The artifact id")),
    output: Flag.path("output").pipe(
      Flag.withAlias("o"),
      Flag.withDescription("Write the HTML to this file"),
      Flag.optional
    ),
  },
  Effect.fnUntraced(function* handler({ id, output }) {
    const apiClient = yield* ApiClient;
    const outputPath = Option.getOrUndefined(output);

    yield* downloadArtifactToOutput({
      apiClient,
      artifactId: id,
      outputPath,
    });
    yield* apiClient.captureCliEvent(ANALYTICS_EVENTS.cliArtifactDownloaded, {
      artifact_id: id,
      output: outputPath ? "file" : "stdout",
    });
  })
).pipe(Command.withDescription("Download an artifact's raw HTML"));
