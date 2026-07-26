import { describe, expect, test } from "bun:test";

import * as Effect from "effect/Effect";
import { HttpClientRequest, HttpClientResponse } from "effect/unstable/http";

import { formatCliError } from "../../src/lib/cli-output";
import {
  fetchArtifactHtml,
  getArtifactUrl,
  getShareUrl,
} from "../../src/services/api-client";

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

describe("fetchArtifactHtml", () => {
  test("fetches and returns a successful response body unchanged", async () => {
    const url = "https://storage.example/artifact";
    const html = "<!doctype html><main>raw artifact</main>";
    const response = HttpClientResponse.fromWeb(
      HttpClientRequest.get(url),
      new Response(html, {
        headers: { "Content-Type": "text/html" },
        status: 200,
      })
    );
    const requestedUrls: (string | URL)[] = [];

    const result = await Effect.runPromise(
      fetchArtifactHtml(url, {
        get: (requestedUrl) => {
          requestedUrls.push(requestedUrl);
          return Effect.succeed(response);
        },
      })
    );

    expect(requestedUrls).toEqual([url]);
    expect(result).toBe(html);
  });

  test("fails with an actionable error when artifact storage returns 404", async () => {
    const url = "https://storage.example/missing-artifact";
    const response = HttpClientResponse.fromWeb(
      HttpClientRequest.get(url),
      new Response("missing", { status: 404 })
    );

    const error = await Effect.runPromise(
      Effect.flip(
        fetchArtifactHtml(url, {
          get: () => Effect.succeed(response),
        })
      )
    );

    expect(formatCliError(error)).toBe(
      "The requested resource was not found. Check the artifact id and try again."
    );
  });
});
