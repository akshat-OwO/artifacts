import { eq, sql } from "drizzle-orm";
import * as D1Drizzle from "drizzle-orm/effect-d1";
import * as Effect from "effect/Effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AuthUser } from "#/lib/auth/context";
import { D1ClientLive } from "#/lib/db";
import { artifact } from "#/lib/db/schemas";
import {
  USER_UPLOAD_GRACE_LIMIT_BYTES,
  USER_UPLOAD_LIMIT_BYTES,
} from "#/lib/errors/upload/file-size";

import { Api } from "../-api";

const getUserArtifactUsageBytes = () =>
  sql<number>`coalesce(sum(${artifact.artifactSizeBytes}), 0)`.mapWith(Number);

export const UsageApiHandler = HttpApiBuilder.group(Api, "usage", (handlers) =>
  handlers.handle("getUsage", () =>
    Effect.gen(function* handler() {
      const db = yield* D1Drizzle.makeWithDefaults({});
      const user = yield* AuthUser;

      const [usage] = yield* db
        .select({ usedBytes: getUserArtifactUsageBytes() })
        .from(artifact)
        .where(eq(artifact.userId, user.id));

      return {
        graceLimitBytes: USER_UPLOAD_GRACE_LIMIT_BYTES,
        limitBytes: USER_UPLOAD_LIMIT_BYTES,
        usedBytes: usage?.usedBytes ?? 0,
      };
    }).pipe(Effect.provide(D1ClientLive))
  )
);
