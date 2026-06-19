import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { HttpServerRequest } from "effect/unstable/http";

import { auth } from "#/lib/auth";
import { AuthUser } from "#/lib/auth/context";
import { Unauthorized } from "#/lib/errors/unauthorized";

import { AuthMiddleware } from "./auth";

export const AuthLive = Layer.succeed(
  AuthMiddleware,
  Effect.fn("AuthMiddleware")(function* AuthLive(handler) {
    const request = yield* HttpServerRequest.HttpServerRequest;

    const session = yield* Effect.tryPromise({
      catch: () => new Unauthorized(),
      try: () =>
        auth.api.getSession({
          headers: new Headers(request.headers),
        }),
    });

    if (!session) {
      return yield* new Unauthorized();
    }

    return yield* Effect.provideService(handler, AuthUser, session.user);
  })
);
