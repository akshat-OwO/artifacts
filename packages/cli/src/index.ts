import { BunRuntime, BunServices } from "@effect/platform-bun";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Command from "effect/unstable/cli/Command";

import { cli } from "./command";
import { formatCliCause, isHelpCause } from "./lib/cli-output";
import { ApiClient } from "./services/api-client";
import { AuthClient } from "./services/auth.client";
import { UserConfig } from "./services/user-config";

interface PackageJson {
  readonly version: string;
}

const packageJson = (await Bun.file(
  new URL("../package.json", import.meta.url)
).json()) as PackageJson;

const AppLive = Layer.mergeAll(
  BunServices.layer,
  AuthClient.layer.pipe(Layer.provideMerge(UserConfig.layer)),
  ApiClient.layer.pipe(
    Layer.provideMerge(Layer.mergeAll(BunServices.layer, UserConfig.layer))
  )
);

cli.pipe(
  Command.run({ version: packageJson.version }),
  Effect.provide(AppLive),
  Effect.catchCause((cause) =>
    Effect.gen(function* handleCliCause() {
      if (!isHelpCause(cause)) {
        yield* Console.error(formatCliCause(cause));
      }

      yield* Effect.sync(() => {
        process.exitCode = 1;
      });
    })
  ),
  BunRuntime.runMain
);
