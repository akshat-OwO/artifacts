import * as Command from "effect/unstable/cli/Command";

import { agentCommand } from "./agent.cmd";
import {
  deleteArtifactCommand,
  getArtifactCommand,
  listArtifactsCommand,
  updateArtifactCommand,
} from "./artifacts.cmd";
import { authCommand } from "./auth.cmd";
import { uploadCommand } from "./upload.cmd";

export const cli = Command.make("artifacts").pipe(
  Command.withDescription("Artifacts cli"),
  Command.withSubcommands([
    agentCommand,
    authCommand,
    deleteArtifactCommand,
    getArtifactCommand,
    listArtifactsCommand,
    updateArtifactCommand,
    uploadCommand,
  ])
);
