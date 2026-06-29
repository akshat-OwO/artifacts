import { describe, expect, test } from "bun:test";

import {
  formatCliError,
  infoMessage,
  successMessage,
} from "../../src/lib/cli-output";
import { plainText } from "../helpers/plain-text";

describe("formatCliError", () => {
  test("explains missing auth for unauthorized errors", () => {
    expect(formatCliError({ _tag: "Unauthorized" })).toBe(
      "You are not logged in. Run `artifacts auth login` and try again."
    );
  });

  test("explains saved auth config parse failures", () => {
    expect(formatCliError({ _tag: "AuthConfigParseError" })).toBe(
      "Your saved auth config could not be read. Run `artifacts auth login` to refresh it."
    );
  });

  test("includes device login descriptions when provided", () => {
    expect(
      formatCliError({
        _tag: "AuthDeviceCodeError",
        description: "device flow is disabled",
      })
    ).toBe("Could not start device login: device flow is disabled");
  });

  test("formats upload size limits in megabytes", () => {
    expect(
      formatCliError({
        _tag: "FileTooLargeError",
        actualBytes: 3 * 1024 * 1024,
        maximumBytes: 2 * 1024 * 1024,
      })
    ).toBe(
      "That file is too large (3.0 MB). Upload a file smaller than 2.0 MB."
    );
  });

  test("maps HTTP client statuses to actionable messages", () => {
    expect(
      formatCliError({
        _tag: "HttpClientError",
        response: { status: 404 },
      })
    ).toBe(
      "The requested resource was not found. Check the artifact id and try again."
    );
  });
});

describe("status messages", () => {
  test("prefixes success messages", () => {
    expect(plainText(successMessage("Artifact deleted."))).toBe(
      "Success Artifact deleted."
    );
  });

  test("prefixes info messages", () => {
    expect(plainText(infoMessage("No artifacts found."))).toBe(
      "Info No artifacts found."
    );
  });
});
