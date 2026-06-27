import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Command from "effect/unstable/cli/Command";

const coreSkillCandidates = [
  new URL("../agent-skills/CORE.md", import.meta.url),
  new URL("../../agent-skills/CORE.md", import.meta.url),
] as const;

export const readCoreSkill = async (): Promise<string> => {
  const candidates = await Promise.all(
    coreSkillCandidates.map(async (path) => {
      const file = Bun.file(path);
      return {
        exists: await file.exists(),
        file,
      };
    })
  );

  const candidate = candidates.find(({ exists }) => exists);

  if (candidate) {
    return candidate.file.text();
  }

  throw new Error("Could not find agent-skills/CORE.md in the CLI package.");
};

const getCoreAgentCommand = Command.make(
  "core",
  {},
  Effect.fnUntraced(function* handler() {
    const coreSkill = yield* Effect.tryPromise({
      catch: (cause) => cause,
      try: readCoreSkill,
    });

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
