import { fileURLToPath } from "node:url";

import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Command from "effect/unstable/cli/Command";

const coreSkillCandidates = [
  fileURLToPath(new URL("../agent-skills/CORE.md", import.meta.url)),
  fileURLToPath(new URL("../../agent-skills/CORE.md", import.meta.url)),
] as const;

export const readCoreSkill = Effect.fn(
  "@artifacts/cli/helpers/agent/readCoreSkill"
)(function* handler() {
  const fs = yield* FileSystem.FileSystem;

  for (const path of coreSkillCandidates) {
    const exists = yield* fs.exists(path);

    if (exists) {
      return yield* fs.readFileString(path);
    }
  }

  return yield* Effect.fail(
    new Error("Could not find agent-skills/CORE.md in the CLI package.")
  );
});

const getCoreAgentCommand = Command.make(
  "core",
  {},
  Effect.fnUntraced(function* handler() {
    const coreSkill = yield* readCoreSkill();

    yield* Console.log(coreSkill);
  })
).pipe(Command.withDescription("Print the core Artifacts agent skill"));

const getAgentCommand = Command.make("get").pipe(
  Command.withDescription("Get an Artifacts agent skill"),
  Command.withSubcommands([getCoreAgentCommand])
);

export const agentCommand = Command.make("agent").pipe(
  Command.withDescription("Agent-facing Artifacts CLI helpers"),
  Command.withSubcommands([getAgentCommand])
);
