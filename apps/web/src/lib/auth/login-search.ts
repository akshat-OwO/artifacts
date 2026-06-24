import type { SearchSchemaInput } from "@tanstack/react-router";
import { z } from "zod";

export const getSafeRedirectPath = (path: string): string | undefined => {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return undefined;
  }

  if (/^\/[^/]*:/.test(path)) {
    return undefined;
  }

  return path;
};

export const loginSearchDefaults = {
  login: false,
} as const;

const loginSearchParser = z.object({
  login: z.boolean().catch(loginSearchDefaults.login),
  redirectTo: z.string().optional(),
});

export type LoginSearch = {
  login?: boolean;
  redirectTo?: string;
};

export const validateLoginSearch = (
  search: Record<string, unknown> & SearchSchemaInput,
): LoginSearch => {
  const parsed = loginSearchParser.parse(search);

  const redirectTo = parsed.redirectTo
    ? getSafeRedirectPath(parsed.redirectTo)
    : undefined;

  return {
    ...(parsed.login ? { login: true } : {}),
    ...(redirectTo ? { redirectTo } : {}),
  };
};
