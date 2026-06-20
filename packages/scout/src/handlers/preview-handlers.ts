import * as Effect from "effect/Effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import type { Page } from "playwright";

import { PreviewError } from "../errors/preview-error";
import { Api } from "../routes";
import { Browser } from "../services/browser";

const closePage = (page: Page) =>
  Effect.tryPromise(() => page.close()).pipe(Effect.orDie);

const MACBOOK_PRO_16_VIEWPORT = {
  height: 1117,
  width: 1728,
} as const;

const createPreview = (url: string) =>
  Effect.gen(function* captureScreenshot() {
    const browser = yield* Browser;
    const page = yield* Effect.acquireRelease(
      Effect.tryPromise(() =>
        browser.newPage({ viewport: MACBOOK_PRO_16_VIEWPORT })
      ),
      closePage
    );

    yield* Effect.tryPromise(() =>
      page.goto(url, { waitUntil: "networkidle" })
    );

    const screenshot = yield* Effect.tryPromise(() =>
      page.screenshot({ type: "png" })
    );

    return yield* Effect.tryPromise(() =>
      new Bun.Image(screenshot).webp().bytes()
    );
  }).pipe(
    Effect.scoped,
    Effect.mapError(
      (cause) =>
        new PreviewError({
          message: cause instanceof Error ? cause.message : String(cause),
        })
    )
  );

export const PreviewApiHandler = HttpApiBuilder.group(
  Api,
  "preview",
  (handlers) =>
    handlers.handle("capture", ({ query }) => createPreview(query.url))
);
