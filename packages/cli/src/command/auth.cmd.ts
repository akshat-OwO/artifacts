import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Command from "effect/unstable/cli/Command";

import { AuthDeviceCodeError } from "../errors/auth-device-code.error";
import { AuthDeviceTokenError } from "../errors/auth-device-token.error";
import { AuthClient } from "../services/auth.client";
import { UserConfig } from "../services/user-config";

const pollAuthToken = Effect.fn("@artifacts/cli/helpers/auth/pollToken")(
  function* handler(clientId: string, deviceCode: string, interval?: number) {
    const authClient = yield* AuthClient;
    return yield* Effect.promise(() =>
      authClient.device.token({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      })
    ).pipe(
      Effect.repeat({
        schedule: Schedule.spaced(`${interval ?? 5} seconds`),
        until: ({ data, error }) => {
          if (data?.access_token) {
            return true;
          } else if (error) {
            switch (error.error) {
              case "authorization_pending": {
                return false;
              }
              default: {
                return true;
              }
            }
          } else {
            return false;
          }
        },
      })
    );
  }
);

const loginAuthCmd = Command.make(
  "login",
  {},
  Effect.fnUntraced(function* handler() {
    const authClient = yield* AuthClient;
    const userConfig = yield* UserConfig;

    const clientId = yield* Config.string("AUTH_CLIENT_ID").pipe(
      Config.withDefault("artifacts-cli")
    );

    const { data: deviceCode, error: deviceCodeError } = yield* Effect.promise(
      () =>
        authClient.device.code({
          client_id: clientId,
        })
    );

    if (deviceCodeError) {
      return yield* new AuthDeviceCodeError({
        description: deviceCodeError.error_description,
        type: deviceCodeError.error,
      });
    }

    if (deviceCode) {
      yield* Console.log(
        "\n1. Open the following URL in your browser to authorize:\n"
      );
      yield* Console.log(deviceCode.verification_uri);
      yield* Console.log(
        "\n2. Enter this one-time code after you are signed in:\n"
      );
      yield* Console.log(deviceCode.user_code);

      const { data: token, error: tokenError } = yield* pollAuthToken(
        clientId,
        deviceCode.device_code,
        deviceCode.interval
      );

      if (tokenError) {
        return yield* new AuthDeviceTokenError({
          description: tokenError.error_description,
          type: tokenError.error,
        });
      }

      if (token?.access_token) {
        yield* userConfig.saveAuthConf(token.access_token);
        yield* Console.log("Authorization Successfull!");
      }
    }
  })
).pipe(Command.withDescription("Login to the Artifacts CLI"));

const authWhoAmiCmd = Command.make(
  "whoami",
  {},
  Effect.fnUntraced(function* handler() {
    const authClient = yield* AuthClient;

    const { data: session } = yield* Effect.promise(() =>
      authClient.getSession()
    );

    if (session) {
      yield* Console.log(
        `You are logged in as ${session.user.name} (${session.user.email})`
      );
      return;
    }

    yield* Console.log("You are not logged in.");
  })
).pipe(Command.withDescription("Get information about the current user"));

const logoutAuthCmd = Command.make(
  "logout",
  {},
  Effect.fnUntraced(function* handler() {
    const authClient = yield* AuthClient;
    const userConfig = yield* UserConfig;

    yield* Effect.promise(() => authClient.signOut());

    yield* userConfig.saveAuthConf("");

    yield* Console.log("You have been logged out.");
  })
).pipe(Command.withDescription("Logout from the Artifacts CLI"));

export const authCommand = Command.make(
  "auth",
  {},
  Effect.fnUntraced(function* handler() {
    yield* Effect.log("Auth cli");
  })
).pipe(
  Command.withDescription("Authenticate with the Artifacts CLI"),
  Command.withSubcommands([loginAuthCmd, authWhoAmiCmd, logoutAuthCmd])
);
