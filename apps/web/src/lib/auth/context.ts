import * as Context from "effect/Context";

import type { auth } from "#/lib/auth";

export class AuthUser extends Context.Service<
  AuthUser,
  typeof auth.$Infer.Session.user
>()("artifacts/auth/AuthUser") {}
