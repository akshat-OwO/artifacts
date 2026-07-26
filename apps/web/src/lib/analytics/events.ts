export const ANALYTICS_EVENTS = {
  artifactDeleted: "artifact deleted",
  artifactShareLinkCopied: "artifact share link copied",
  artifactShared: "artifact shared",
  artifactUnshared: "artifact unshared",
  artifactUpdated: "artifact updated",
  artifactUploaded: "artifact uploaded",
  cliArtifactDeleted: "cli artifact deleted",
  cliArtifactDownloaded: "cli artifact downloaded",
  cliArtifactFetched: "cli artifact fetched",
  cliArtifactListed: "cli artifact listed",
  cliArtifactShared: "cli artifact shared",
  cliArtifactUnshared: "cli artifact unshared",
  cliArtifactUpdated: "cli artifact updated",
  cliArtifactUploaded: "cli artifact uploaded",
  loginDialogShown: "login dialog shown",
  loginStarted: "login started",
  pageLeft: "$pageleave",
  pageViewed: "$pageview",
  themeToggled: "theme toggled",
  uploadDropped: "upload dropped",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProperties = Record<string, unknown>;
