import { describe, expect, test } from "bun:test";

import * as Effect from "effect/Effect";
import { HttpClientRequest, HttpClientResponse } from "effect/unstable/http";

import { formatCliError } from "../../src/lib/cli-output";
import {
  fetchArtifactHtml,
  getArtifactUrl,
  getShareUrl,
  withArtifactDownloadError,
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

  test("fails with an actionable error without exposing a rejected storage URL", async () => {
    const url =
      "https://storage.example/artifact?X-Amz-Credential=sensitive-value";
    const response = HttpClientResponse.fromWeb(
      HttpClientRequest.get(url),
      new Response("forbidden", { status: 403 })
    );

    const error = await Effect.runPromise(
      Effect.flip(
        fetchArtifactHtml(url, {
          get: () => Effect.succeed(response),
        })
      )
    );

    const message = formatCliError(error);

    expect(message).toBe(
      "Could not download the artifact HTML. Please try again; if the problem continues, check the server's artifact storage configuration."
    );
    expect(message).not.toContain(url);
    expect(error).toMatchObject({ _tag: "ArtifactDownloadError" });
  });
});

describe("withArtifactDownloadError", () => {
  test("maps signed URL retrieval failures to the download error", async () => {
    const previewError = { _tag: "PreviewError" } as const;

    const error = await Effect.runPromise(
      Effect.flip(withArtifactDownloadError(Effect.fail(previewError)))
    );

    expect(error).toMatchObject({
      _tag: "ArtifactDownloadError",
      cause: previewError,
    });
  });
});
