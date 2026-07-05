export const getAnalyticsEnvironment = (origin: string) => {
  try {
    const { hostname } = new URL(origin);

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "local";
    }
  } catch {
    return "unknown";
  }

  return "production";
};
