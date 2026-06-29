import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Semaphore from "effect/Semaphore";

const DEFAULT_MAX_CONCURRENT_PREVIEWS = 1;

const maxConcurrentPreviews = Config.int("MAX_CONCURRENT_PREVIEWS").pipe(
  Config.withDefault(DEFAULT_MAX_CONCURRENT_PREVIEWS)
);

export class PreviewLock extends Context.Service<
  PreviewLock,
  Semaphore.Semaphore
>()("@artifacts/scout/PreviewLock") {}

export const PreviewLockLive = Layer.effect(
  PreviewLock,
  Effect.gen(function* makePreviewLock() {
    const permits = yield* maxConcurrentPreviews;
    return yield* Semaphore.make(permits);
  })
);
