import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { bearer, deviceAuthorization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import {
  account,
  deviceCode,
  user,
  session,
  verification,
  authRelations,
} from "#/lib/db/schemas";

const db = drizzle(env.artifacts_db, { relations: authRelations });

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
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
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
});
