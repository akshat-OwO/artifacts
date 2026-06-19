import { PgClient } from "@effect/sql-pg";
import * as Redacted from "effect/Redacted";
import { types } from "pg";

export const PgClientLive = PgClient.layer({
  types: {
    getTypeParser: (typeId, format) => {
      // Return raw values for date/time types to let Drizzle handle parsing
      if (
        [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
      ) {
        return (val: unknown) => val;
      }
      return types.getTypeParser(typeId, format);
    },
  },
  url: Redacted.make(Bun.env.DATABASE_URL || ""),
});
