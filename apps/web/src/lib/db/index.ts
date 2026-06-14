import { PgClient } from "@effect/sql-pg";
import * as Config from "effect/Config";

export const PgLive = PgClient.layerConfig({
  url: Config.redacted(Bun.env.Database_URL),
});
