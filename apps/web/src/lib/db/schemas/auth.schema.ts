import { defineRelations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  createdAt: timestamp("created_at").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    createdAt: timestamp("created_at").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at").notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    createdAt: timestamp("created_at").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const deviceCode = pgTable("device_code", {
  clientId: text("client_id"),
  deviceCode: text("device_code").notNull(),
  expiresAt: timestamp("expires_at", {
    precision: 6,
    withTimezone: true,
  }).notNull(),
  id: text("id").primaryKey(),
  lastPolledAt: timestamp("last_polled_at", {
    precision: 6,
    withTimezone: true,
  }),
  pollingInterval: integer("polling_interval"),
  scope: text("scope"),
  status: text("status").notNull(),
  userCode: text("user_code").notNull(),
  userId: text("user_id"),
});

const authSchema = { account, deviceCode, session, user, verification };

export const authRelations = defineRelations(authSchema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  user: {
    accounts: r.many.account(),
    sessions: r.many.session(),
  },
}));
