import { D1Client } from "@effect/sql-d1";
import { env } from "cloudflare:workers";
import * as Layer from "effect/Layer";

// The binding is supplied directly from the Worker env rather than from
// Config, so a ConfigError here is a deployment defect, not a request error.
export const D1ClientLive = Layer.orDie(
  D1Client.layer({ db: env.artifacts_db })
);
