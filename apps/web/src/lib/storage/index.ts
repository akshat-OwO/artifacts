import { env } from "cloudflare:workers";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { Files } from "files-sdk";
import { r2 } from "files-sdk/r2";
import type { R2Adapter, R2Bucket } from "files-sdk/r2";

export class Storage extends Context.Service<
  Storage,
  {
    readonly r2: Files<R2Adapter>;
  }
>()("artifacts/storage") {}

export const StorageLive = Layer.succeed(Storage, {
  r2: new Files({
    adapter: r2({
      accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      // Wrangler's generated `worker-configuration.d.ts` and the
      // `@cloudflare/workers-types` copy that files-sdk types against are two
      // separate declarations of the same runtime type, so they don't unify.
      binding: env.artifacts_bucket as unknown as R2Bucket,
      bucket: "artifacts-bucket",
      // publicBaseUrl: env.CLOUDFLARE_BUCKET_BASE_URL,
      secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    }),
  }),
});
