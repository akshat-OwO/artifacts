import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { optionalBooleanSearchParam } from "./search";

const schema = Schema.Struct({
  onlyContent: optionalBooleanSearchParam,
}).pipe(Schema.toStandardSchemaV1);

const decode = (search: unknown) => {
  const result = schema["~standard"].validate(search);

  if (result instanceof Promise) {
    throw new TypeError("Search validation must be synchronous");
  }

  if (result.issues) {
    throw new Error(
      `Search validation failed: ${JSON.stringify(result.issues)}`
    );
  }

  return result.value;
};

describe("optionalBooleanSearchParam", () => {
  it("leaves the key absent when the param is missing", () => {
    expect(decode({})).toEqual({});
  });

  it("keeps booleans parsed from the URL", () => {
    expect(decode({ onlyContent: true })).toEqual({ onlyContent: true });
    expect(decode({ onlyContent: false })).toEqual({ onlyContent: false });
  });

  it("accepts common truthy and falsy spellings", () => {
    expect(decode({ onlyContent: "true" })).toEqual({ onlyContent: true });
    expect(decode({ onlyContent: "YES" })).toEqual({ onlyContent: true });
    expect(decode({ onlyContent: 1 })).toEqual({ onlyContent: true });
    expect(decode({ onlyContent: "" })).toEqual({ onlyContent: true });
    expect(decode({ onlyContent: "false" })).toEqual({ onlyContent: false });
    expect(decode({ onlyContent: "off" })).toEqual({ onlyContent: false });
    expect(decode({ onlyContent: 0 })).toEqual({ onlyContent: false });
  });

  it("decodes unrecognized values to undefined so routes can default", () => {
    expect(decode({ onlyContent: "nonsense" })).toEqual({
      onlyContent: undefined,
    });
    expect(decode({ onlyContent: null })).toEqual({ onlyContent: undefined });
  });

  it("ignores unrelated search params", () => {
    expect(decode({ login: true })).toEqual({});
  });
});
