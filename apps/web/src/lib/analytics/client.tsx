import { PostHogProvider, usePostHog } from "@posthog/react";
import { useRouteContext, useRouterState } from "@tanstack/react-router";
import type { PostHog, PostHogConfig } from "posthog-js";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";

import { ANALYTICS_EVENTS } from "#/lib/analytics/events";
import type {
  AnalyticsEventName,
  AnalyticsProperties,
} from "#/lib/analytics/events";

export { ANALYTICS_EVENTS } from "#/lib/analytics/events";

const POSTHOG_DEFAULTS = "2026-05-30";
const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

const postHogApiKey = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN ?? "";

const getTracingHost = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;

  if (!baseUrl) {
    return;
  }

  try {
    return new URL(baseUrl).host;
  } catch {
    return null;
  }
};

const tracingHost = getTracingHost();

const postHogOptions = {
  api_host: import.meta.env.VITE_POSTHOG_HOST || DEFAULT_POSTHOG_HOST,
  autocapture: true,
  capture_exceptions: true,
  capture_pageview: false,
  defaults: POSTHOG_DEFAULTS,
  person_profiles: "identified_only",
  ...(tracingHost ? { tracing_headers: [tracingHost] } : {}),
} satisfies Partial<PostHogConfig>;

export const isPostHogConfigured = () => postHogApiKey.length > 0;

export const captureClientEvent = (
  posthog: PostHog,
  event: AnalyticsEventName,
  properties?: AnalyticsProperties
) => {
  if (!isPostHogConfigured()) {
    return;
  }

  posthog.capture(event, properties);
};

const PostHogIdentity = () => {
  const posthog = usePostHog();
  const { session } = useRouteContext({ from: "__root__" });
  const user = session?.user;
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPostHogConfigured()) {
      return;
    }

    if (!user) {
      if (identifiedUserIdRef.current) {
        posthog.reset();
        identifiedUserIdRef.current = null;
      }
      return;
    }

    if (identifiedUserIdRef.current === user.id) {
      return;
    }

    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
    });
    identifiedUserIdRef.current = user.id;
  }, [posthog, user]);

  return null;
};

const PostHogPageviews = () => {
  const posthog = usePostHog();
  const { session } = useRouteContext({ from: "__root__" });
  const location = useRouterState({ select: (state) => state.location });
  const userStatus = session?.user ? "logged_in" : "anonymous";

  useEffect(() => {
    if (!isPostHogConfigured() || typeof window === "undefined") {
      return;
    }

    posthog.capture(ANALYTICS_EVENTS.pageViewed, {
      $current_url: window.location.href,
      path: location.pathname,
      search: location.searchStr,
      user_status: userStatus,
    });
  }, [location.pathname, location.searchStr, posthog, userStatus]);

  return null;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const options = useMemo(() => postHogOptions, []);

  if (!isPostHogConfigured()) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider apiKey={postHogApiKey} options={options}>
      <PostHogIdentity />
      <PostHogPageviews />
      {children}
    </PostHogProvider>
  );
};
