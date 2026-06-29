import * as Command from "effect/unstable/cli/Command";

import {
  deleteArtifactCommand,
  getArtifactCommand,
  listArtifactsCommand,
  updateArtifactCommand,
} from "./artifacts.cmd";
import { authCommand } from "./auth.cmd";
import { shareCommand, unshareCommand } from "./share.cmd";
import { uploadCommand } from "./upload.cmd";

export const cli = Command.make("artifacts").pipe(
  Command.withDescription("Artifacts cli"),
  Command.withSubcommands([
    authCommand,
    deleteArtifactCommand,
    getArtifactCommand,
    listArtifactsCommand,
    shareCommand,
    unshareCommand,
    updateArtifactCommand,
    uploadCommand,
  ])
);
