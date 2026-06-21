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

const NAVIGATION_TIMEOUT_MS = 30_000;

const errorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  if ("cause" in error && error.cause !== undefined) {
    return error.cause instanceof Error
      ? error.cause.message
      : String(error.cause);
  }

  return error.message;
};

const previewOperation = <A>(
  operation: string,
  evaluate: (signal: AbortSignal) => PromiseLike<A>
): Effect.Effect<A, PreviewError> =>
  Effect.tryPromise({
    catch: (cause) =>
      new PreviewError({
        message: `${operation}: ${cause instanceof Error ? cause.message : String(cause)}`,
      }),
    try: evaluate,
  });

const createPreview = (url: string) =>
  Effect.gen(function* captureScreenshot() {
    const browser = yield* Browser;
    const page = yield* Effect.acquireRelease(
      previewOperation("Create browser page", () =>
        browser.newPage({ viewport: MACBOOK_PRO_16_VIEWPORT })
      ),
      closePage
    );

    yield* previewOperation("Navigate to preview URL", () =>
      page.goto(url, {
        timeout: NAVIGATION_TIMEOUT_MS,
        waitUntil: "load",
      })
    );

    const screenshot = yield* previewOperation("Capture screenshot", () =>
      page.screenshot({ type: "png" })
    );

    return yield* previewOperation("Convert screenshot to WebP", () =>
      new Bun.Image(screenshot).webp().bytes()
    );
  }).pipe(
    Effect.scoped,
    Effect.tapCause((cause) =>
      Effect.logError("Preview generation failed", cause)
    ),
    Effect.mapError(
      (cause) => new PreviewError({ message: errorMessage(cause) })
    )
  );

export const PreviewApiHandler = HttpApiBuilder.group(
  Api,
  "preview",
  (handlers) =>
    handlers.handle("capture", ({ query }) => createPreview(query.url))
);
