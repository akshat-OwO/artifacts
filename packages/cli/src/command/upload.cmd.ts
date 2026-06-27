import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Argument from "effect/unstable/cli/Argument";
import * as Command from "effect/unstable/cli/Command";
import * as Prompt from "effect/unstable/cli/Prompt";

import { ApiClient } from "../services/api-client";

export const uploadCommand = Command.make(
  "upload",
  {
    path: Argument.path("path").pipe(
      Argument.withDescription("The path to the file to upload"),
      Argument.withFallbackPrompt(
        Prompt.file({ message: "Enter the path to the file to upload" })
      )
    ),
  },
  Effect.fnUntraced(function* handler({ path }) {
    const apiClient = yield* ApiClient;

    const {
      data: { id },
    } = yield* apiClient.uploadArtifact(path);

    yield* Console.log(apiClient.artifactUrl(id));
  })
).pipe(Command.withDescription("Upload a artifacts"));
