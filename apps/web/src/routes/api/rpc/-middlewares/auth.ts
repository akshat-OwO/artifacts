import { HttpApiMiddleware } from "effect/unstable/httpapi";

import type { AuthUser } from "#/lib/auth/context";
import { Unauthorized } from "#/lib/errors/unauthorized";

export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  {
    provides: AuthUser;
  }
>()("artifacts/api/middleware/auth", {
  error: Unauthorized,
}) {}
