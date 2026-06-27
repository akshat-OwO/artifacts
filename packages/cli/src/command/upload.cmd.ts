import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Argument from "effect/unstable/cli/Argument";
import * as Command from "effect/unstable/cli/Command";
import * as Flag from "effect/unstable/cli/Flag";
import * as Prompt from "effect/unstable/cli/Prompt";

import { ApiClient } from "../services/api-client";

export const uploadCommand = Command.make(
  "upload",
  {
    name: Flag.string("name").pipe(
      Flag.withDescription("The name to assign to the artifact"),
      Flag.optional
    ),
    path: Argument.path("path").pipe(
      Argument.withDescription("The path to the file to upload"),
      Argument.withFallbackPrompt(
        Prompt.file({ message: "Enter the path to the file to upload" })
      )
    ),
  },
  Effect.fnUntraced(function* handler({ name, path }) {
    const apiClient = yield* ApiClient;

    const {
      data: { id },
    } = yield* apiClient.uploadArtifact(path, Option.getOrUndefined(name));

    yield* Console.log(apiClient.artifactUrl(id));
  })
).pipe(Command.withDescription("Upload an artifact"));
