import * as Effect from "effect/Effect";
import * as Command from "effect/unstable/cli/Command";

import { authCommand } from "./auth.cmd";

export const cli = Command.make(
  "artifacts",
  {},
  Effect.fnUntraced(function* handler() {
    yield* Effect.log("Artifacts cli");
  })
).pipe(
  Command.withDescription("Artifacts cli"),
  Command.withSubcommands([authCommand])
);
