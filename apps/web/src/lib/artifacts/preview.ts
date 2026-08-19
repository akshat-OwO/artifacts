const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";

/**
 * Fallback preview image served from the `public/` folder. Used for artifact
 * cards and for og/twitter images until a captured preview exists.
 */
export const DEFAULT_ARTIFACT_PREVIEW_PATH = "/preview/preview-fallback.png";

export const getDefaultArtifactPreviewUrl = (baseUrl?: string) =>
  new URL(
    DEFAULT_ARTIFACT_PREVIEW_PATH,
    baseUrl ?? DEFAULT_LOCAL_BASE_URL
  ).toString();
