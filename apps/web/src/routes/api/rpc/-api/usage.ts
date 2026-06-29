import { EffectDrizzleQueryError } from "drizzle-orm/effect-core";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import { SqlError } from "effect/unstable/sql/SqlError";

import { UsageInfo } from "#/lib/schemas/usage";

import { AuthMiddleware } from "../-middlewares/auth";

export class UsageApi extends HttpApiGroup.make("usage")
  .add(
    HttpApiEndpoint.get("getUsage", "/usage", {
      error: [EffectDrizzleQueryError, SqlError],
      success: UsageInfo,
    })
  )
  .middleware(AuthMiddleware) {}
