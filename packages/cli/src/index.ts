import { BunRuntime, BunServices } from "@effect/platform-bun";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Command from "effect/unstable/cli/Command";

import { cli } from "./command";
import { ApiClient } from "./services/api-client";
import { AuthClient } from "./services/auth.client";
import { UserConfig } from "./services/user-config";

const AppLive = Layer.mergeAll(
  BunServices.layer,
  AuthClient.layer.pipe(Layer.provideMerge(UserConfig.layer)),
  ApiClient.layer.pipe(
    Layer.provideMerge(Layer.mergeAll(BunServices.layer, UserConfig.layer))
  )
);

cli.pipe(
  Command.run({ version: "0.0.1" }),
  Effect.provide(AppLive),
  BunRuntime.runMain
);
