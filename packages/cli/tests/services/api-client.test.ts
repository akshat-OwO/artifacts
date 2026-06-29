import { describe, expect, test } from "bun:test";

import { getArtifactUrl, getShareUrl } from "../../src/services/api-client";

describe("getArtifactUrl", () => {
  test("builds an artifact URL from a base URL and id", () => {
    expect(getArtifactUrl("https://artifacts.example", "artifact-id")).toBe(
      "https://artifacts.example/a/artifact-id"
    );
  });

  test("removes trailing slashes from the base URL", () => {
    expect(getArtifactUrl("https://artifacts.example///", "artifact-id")).toBe(
      "https://artifacts.example/a/artifact-id"
    );
  });
});

describe("getShareUrl", () => {
  test("builds a public share URL from a base URL and id", () => {
    expect(getShareUrl("https://artifacts.example", "artifact-id")).toBe(
      "https://artifacts.example/s/artifact-id"
    );
  });

  test("removes trailing slashes from the base URL", () => {
    expect(getShareUrl("https://artifacts.example///", "artifact-id")).toBe(
      "https://artifacts.example/s/artifact-id"
    );
  });
});
