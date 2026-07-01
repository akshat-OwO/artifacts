import * as Effect from "effect/Effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import type { Page } from "playwright";

import { PreviewError } from "../errors/preview-error";
import { Api } from "../routes";
import { Browser } from "../services/browser";
import { PreviewLock } from "../services/preview-lock";

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

const summarizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search ? "?..." : ""}`;
  } catch {
    return "[invalid-url]";
  }
};

const generatePreview = (url: string) =>
  Effect.gen(function* captureScreenshot() {
    yield* Effect.logInfo("Scout preview generation started", {
      url: summarizeUrl(url),
    });
    const browser = yield* Browser;
    const page = yield* Effect.acquireRelease(
      previewOperation("Create browser page", () =>
        browser.newPage({ viewport: MACBOOK_PRO_16_VIEWPORT })
      ),
      closePage
    );
    yield* Effect.logInfo("Scout browser page created", {
      url: summarizeUrl(url),
    });

    yield* previewOperation("Navigate to preview URL", () =>
      page.goto(url, {
        timeout: NAVIGATION_TIMEOUT_MS,
        waitUntil: "load",
      })
    );
    yield* Effect.logInfo("Scout preview URL loaded", {
      url: summarizeUrl(url),
    });

    const screenshot = yield* previewOperation("Capture screenshot", () =>
      page.screenshot({ type: "png" })
    );
    yield* Effect.logInfo("Scout screenshot captured", {
      bytes: screenshot.byteLength,
      url: summarizeUrl(url),
    });

    const webp = yield* previewOperation("Convert screenshot to WebP", () =>
      new Bun.Image(screenshot).webp().bytes()
    );
    yield* Effect.logInfo("Scout screenshot converted to WebP", {
      bytes: webp.byteLength,
      url: summarizeUrl(url),
    });
    return webp;
  }).pipe(
    Effect.scoped,
    Effect.tapCause((cause) =>
      Effect.logError("Preview generation failed", cause)
    ),
    Effect.mapError(
      (cause) => new PreviewError({ message: errorMessage(cause) })
    )
  );

const createPreview = (url: string) =>
  Effect.gen(function* serializePreview() {
    yield* Effect.logInfo("Scout preview capture queued", {
      url: summarizeUrl(url),
    });
    const lock = yield* PreviewLock;
    const preview = yield* lock.withPermit(generatePreview(url));
    yield* Effect.logInfo("Scout preview capture completed", {
      bytes: preview.byteLength,
      url: summarizeUrl(url),
    });
    return preview;
  });

export const PreviewApiHandler = HttpApiBuilder.group(
  Api,
  "preview",
  (handlers) =>
    handlers.handle("capture", ({ query }) => createPreview(query.url))
);
