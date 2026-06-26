import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { UserConfig } from "./user-config";

export class AuthClient extends Context.Service<AuthClient>()(
  "@artifacts/cli/services/authClient",
  {
    make: Effect.gen(function* handler() {
      const userConfig = yield* UserConfig;

      const baseURL = yield* Config.string("BASE_URL").pipe(
        Config.withDefault(
          process.env.NODE_ENV === "production"
            ? "https://artifacts.4kshat.dev"
            : "http://localhost:3000"
        )
      );

      const authConfig = yield* userConfig.readAuthConf();

      const client = createAuthClient({
        baseURL,
        fetchOptions: authConfig.accessToken
          ? {
              auth: {
                token: authConfig.accessToken,
                type: "Bearer",
              },
            }
          : undefined,
        plugins: [deviceAuthorizationClient()],
      });
      return client;
    }),
  }
) {
  static readonly layer = Layer.effect(this, this.make);
}
