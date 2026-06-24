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

export const loginSearchSchema = Schema.Struct({
  login: Schema.Boolean.pipe(
    Schema.optional,
    Schema.withDecodingDefaultType(Effect.succeed(loginSearchDefaults.login)),
  ),
  redirectTo: Schema.optionalKey(Schema.String),
}).pipe(Schema.toStandardSchemaV1);

export type LoginSearch = Schema.Schema.Type<typeof loginSearchSchema>;
