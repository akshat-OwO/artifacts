import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

const TRUTHY_SEARCH_VALUES = new Set(["", "1", "on", "true", "yes"]);
const FALSY_SEARCH_VALUES = new Set(["0", "off", "false", "no"]);

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (TRUTHY_SEARCH_VALUES.has(normalized)) {
    return true;
  }

  if (FALSY_SEARCH_VALUES.has(normalized)) {
    return false;
  }

  return undefined;
};

/**
 * Boolean search param that accepts the common URL spellings (`true`, `1`,
 * `on`, a valueless key, and their negatives) and decodes anything else to
 * `undefined` instead of failing, so a malformed URL never breaks the page.
 *
 * The key stays optional so search validation does not rewrite clean URLs:
 * routes apply their own default when the param is absent.
 */
export const optionalBooleanSearchParam = Schema.optionalKey(
  Schema.Unknown.pipe(
    Schema.decodeTo(
      Schema.UndefinedOr(Schema.Boolean),
      SchemaTransformation.transform({
        decode: toBoolean,
        encode: (value: boolean | undefined) => value as unknown,
      })
    )
  )
);
