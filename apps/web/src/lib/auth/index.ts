import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { bearer, deviceAuthorization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzle } from "drizzle-orm/node-postgres";

import {
  account,
  deviceCode,
  user,
  session,
  verification,
  authRelations,
} from "#/lib/db/schemas";

const db = drizzle(Bun.env.DATABASE_URL ?? "", { relations: authRelations });

export const auth = betterAuth({
  baseURL: Bun.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { account, deviceCode, session, user, verification },
  }),
  plugins: [
    bearer(),
    deviceAuthorization({
      schema: {},
      verificationUri: "/auth/device",
    }),
    tanstackStartCookies(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      // 5 minutes cookie cache
      maxAge: 5 * 60,
    },
  },
  socialProviders: {
    google: {
      clientId: Bun.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: Bun.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
});
