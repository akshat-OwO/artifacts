export interface LoginSearch {
  login?: boolean;
  redirectTo?: string;
}

export const getSafeRedirectPath = (path: string): string | undefined => {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return undefined;
  }

  if (/^\/[^/]*:/.test(path)) {
    return undefined;
  }

  return path;
};

export const parseLoginSearch = (
  search: Record<string, unknown>,
): LoginSearch => {
  const login =
    search.login === true ||
    search.login === "true" ||
    search.login === 1 ||
    search.login === "1";

  const redirectTo =
    typeof search.redirectTo === "string"
      ? getSafeRedirectPath(search.redirectTo)
      : undefined;

  return {
    ...(login ? { login: true } : {}),
    ...(redirectTo ? { redirectTo } : {}),
  };
};
