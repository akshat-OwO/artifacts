import * as Effect from "effect/Effect";
import * as Command from "effect/unstable/cli/Command";

import { getArtifactCommand, listArtifactsCommand } from "./artifacts.cmd";
import { authCommand } from "./auth.cmd";
import { uploadCommand } from "./upload.cmd";

export const cli = Command.make(
  "artifacts",
  {},
  Effect.fnUntraced(function* handler() {
    yield* Effect.log("Artifacts cli");
  })
).pipe(
  Command.withDescription("Artifacts cli"),
  Command.withSubcommands([
    authCommand,
    getArtifactCommand,
    listArtifactsCommand,
    uploadCommand,
  ])
);
