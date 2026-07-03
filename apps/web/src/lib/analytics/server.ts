import * as Effect from "effect/Effect";
import { PostHog } from "posthog-node";

import type {
  AnalyticsEventName,
  AnalyticsProperties,
} from "#/lib/analytics/events";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

let posthogClient: PostHog | null = null;

const getPostHogProjectToken = () =>
  process.env.VITE_POSTHOG_PROJECT_TOKEN ?? "";

const getPostHogHost = () =>
  process.env.VITE_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

const getPostHogClient = () => {
  const projectToken = getPostHogProjectToken();

  if (!projectToken) {
    return null;
  }

  posthogClient ??= new PostHog(projectToken, {
    flushAt: 1,
    flushInterval: 0,
    host: getPostHogHost(),
  });

  return posthogClient;
};

interface CaptureServerEventInput {
  distinctId: string;
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
}

export const captureServerEvent = ({
  distinctId,
  event,
  properties,
}: CaptureServerEventInput) =>
  Effect.sync(() => {
    getPostHogClient()?.capture({
      distinctId,
      event,
      ...(properties ? { properties } : {}),
    });
  }).pipe(
    Effect.catchCause((cause) =>
      Effect.logError("Failed to capture PostHog event", cause)
    )
  );
