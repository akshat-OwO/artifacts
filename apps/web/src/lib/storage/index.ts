import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { Files } from "files-sdk";
import { r2 } from "files-sdk/r2";
import type { R2Adapter } from "files-sdk/r2";

export class Storage extends Context.Service<
  Storage,
  {
    readonly r2: Files<R2Adapter>;
  }
>()("artifacts/storage") {}

export const StorageLive = Layer.succeed(Storage, {
  r2: new Files({
    adapter: r2({
      accessKeyId: process.env.CF_ACCESS_KEY_ID || "",
      accountId: process.env.CF_ACCOUNT_ID || "",
      bucket: process.env.CF_R2_BUCKET || "",
      secretAccessKey: process.env.CF_SECRET_ACCESS_KEY || "",
    }),
  }),
});
