import os from "node:os";
import path from "node:path";

import { BunServices } from "@effect/platform-bun";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";

export interface AuthConfig {
  readonly accessToken?: string;
}

const createConfigIfNotExists = Effect.fn(
  "@artifacts/cli/helpers/config/check"
)(function* handler(fs: FileSystem.FileSystem) {
  const configPath = Match.value(process.platform).pipe(
    Match.when("win32", () =>
      // oxlint-disable-next-line no-non-null-assertion
      path.join(process.env.APPDATA!, "artifacts")
    ),
    Match.orElse(() => path.join(os.homedir(), ".config", "artifacts"))
  );

  const configExists = yield* fs.exists(configPath);
  if (!configExists) {
    yield* fs.makeDirectory(configPath, { recursive: true });
  }

  return configPath;
});

export class UserConfig extends Context.Service<UserConfig>()(
  "@artifacts/cli/services/userConfig",
  {
    make: Effect.gen(function* handler() {
      const fs = yield* FileSystem.FileSystem;

      const configPath = yield* createConfigIfNotExists(fs);

      const saveAuthConf = Effect.fn(
        "@artifacts/cli/helpers/config/saveAuthConf"
      )(function* saveAuthConfHandler(accessToken: string) {
        const authConfigFile = path.join(configPath, "auth.json");

        const json = JSON.stringify({ accessToken }, null, 2);
        const bytes = new TextEncoder().encode(json);

        yield* fs.writeFile(authConfigFile, bytes);
      });

      const readAuthConf = Effect.fn(
        "@artifacts/cli/helpers/configr/readAuthConfig"
      )(function* readAuthConfigHandler() {
        const authConfigPath = path.join(configPath, "auth.json");
        const bytes = yield* fs
          .readFile(authConfigPath)
          .pipe(
            Effect.catchTag("PlatformError", (error) =>
              error.reason._tag === "NotFound"
                ? Effect.succeed(new Uint8Array())
                : Effect.fail(error)
            )
          );

        if (bytes.length === 0) {
          return {};
        }

        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json) as AuthConfig;
      });

      return { readAuthConf, saveAuthConf };
    }).pipe(Effect.provide(BunServices.layer)),
  }
) {
  static readonly layer = Layer.effect(this, this.make);
}
