import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { chromium } from "playwright";
import type { Browser as PlaywrightBrowser } from "playwright";

import { BrowserLaunchError } from "../errors/browser-launch-error";

export class Browser extends Context.Service<Browser, PlaywrightBrowser>()(
  "@artifacts/scout/Browser"
) {}

const launchBrowser = Effect.tryPromise({
  catch: (cause) =>
    new BrowserLaunchError({
      cause: cause instanceof Error ? cause.message : String(cause),
      message: "Failed to launch the Playwright browser",
    }),
  try: () => chromium.launch({ headless: true }),
});

const closeBrowser = (browser: PlaywrightBrowser) =>
  Effect.tryPromise(() => browser.close()).pipe(Effect.orDie);

export const BrowserLive = Layer.effect(
  Browser,
  Effect.acquireRelease(launchBrowser, closeBrowser)
);
