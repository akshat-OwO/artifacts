import type { SearchSchemaInput } from "@tanstack/react-router";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

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

const loginSearchParser = Schema.Struct({
  login: Schema.Boolean.pipe(
    Schema.optional,
    Schema.withDecodingDefaultType(Effect.succeed(loginSearchDefaults.login)),
  ),
  redirectTo: Schema.optionalKey(Schema.String),
});

type ParsedLoginSearch = Schema.Schema.Type<typeof loginSearchParser>;

export type LoginSearch = {
  login?: boolean;
  redirectTo?: string;
};

const toLoginSearch = ({ login, redirectTo }: ParsedLoginSearch): LoginSearch => {
  const safeRedirectTo = redirectTo
    ? getSafeRedirectPath(redirectTo)
    : undefined;

  return {
    ...(login ? { login: true } : {}),
    ...(safeRedirectTo ? { redirectTo: safeRedirectTo } : {}),
  };
};

export const validateLoginSearch = (
  search: Record<string, unknown> & SearchSchemaInput,
): LoginSearch => {
  try {
    return toLoginSearch(Schema.decodeUnknownSync(loginSearchParser)(search));
  } catch {
    return {};
  }
};
