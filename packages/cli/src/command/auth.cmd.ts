import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Command from "effect/unstable/cli/Command";

import { AuthDeviceCodeError } from "../errors/auth-device-code.error";
import { AuthDeviceTokenError } from "../errors/auth-device-token.error";
import { infoMessage, style, successMessage } from "../lib/cli-output";
import { AuthClient } from "../services/auth.client";
import { UserConfig } from "../services/user-config";

const pollAuthToken = Effect.fn("@artifacts/cli/helpers/auth/pollToken")(
  function* handler(clientId: string, deviceCode: string, interval?: number) {
    const authClient = yield* AuthClient;
    return yield* Effect.tryPromise({
      catch: (cause) => cause,
      try: () =>
        authClient.device.token({
          client_id: clientId,
          device_code: deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
    }).pipe(
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

    const { data: deviceCode, error: deviceCodeError } =
      yield* Effect.tryPromise({
        catch: (cause) => cause,
        try: () =>
          authClient.device.code({
            client_id: clientId,
          }),
      });

    if (deviceCodeError) {
      return yield* new AuthDeviceCodeError({
        description: deviceCodeError.error_description,
        type: deviceCodeError.error,
      });
    }

    if (deviceCode) {
      yield* Console.log(style.heading("Authorize Artifacts CLI"));
      yield* Console.log(
        `${style.label("1.")} Open this URL in your browser:\n${style.link(
          deviceCode.verification_uri
        )}`
      );
      yield* Console.log(
        `${style.label("2.")} Enter this one-time code:\n${style.code(
          deviceCode.user_code
        )}`
      );
      yield* Console.log(infoMessage("Waiting for browser authorization..."));

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
        yield* Console.log(successMessage("Authorization successful."));
      }
    }
  })
).pipe(Command.withDescription("Login to the Artifacts CLI"));

const authWhoAmiCmd = Command.make(
  "whoami",
  {},
  Effect.fnUntraced(function* handler() {
    const authClient = yield* AuthClient;

    const { data: session } = yield* Effect.tryPromise({
      catch: (cause) => cause,
      try: () => authClient.getSession(),
    });

    if (session) {
      yield* Console.log(
        `${style.success("Logged in")} as ${style.label(
          session.user.name
        )} ${style.muted(`<${session.user.email}>`)}`
      );
      return;
    }

    yield* Console.log(infoMessage("You are not logged in."));
  })
).pipe(Command.withDescription("Get information about the current user"));

const logoutAuthCmd = Command.make(
  "logout",
  {},
  Effect.fnUntraced(function* handler() {
    const authClient = yield* AuthClient;
    const userConfig = yield* UserConfig;

    yield* Effect.tryPromise({
      catch: (cause) => cause,
      try: () => authClient.signOut(),
    });

    yield* userConfig.saveAuthConf("");

    yield* Console.log(successMessage("You have been logged out."));
  })
).pipe(Command.withDescription("Logout from the Artifacts CLI"));

export const authCommand = Command.make("auth").pipe(
  Command.withDescription("Authenticate with the Artifacts CLI"),
  Command.withSubcommands([loginAuthCmd, authWhoAmiCmd, logoutAuthCmd])
);
