import { describe, expect, test } from "bun:test";

import {
  formatArtifactsTable,
  formatRelativeDate,
} from "../../src/command/artifacts.cmd";
import { plainText } from "../helpers/plain-text";

describe("formatRelativeDate", () => {
  test("adds the CLI suffix", () => {
    const oneMinuteAgo = new Date(Date.now() - 60_000);

    expect(formatRelativeDate(oneMinuteAgo)).toEndWith(" ago");
  });
});

describe("formatArtifactsTable", () => {
  test("renders a header and one row per artifact", () => {
    const now = new Date();
    const artifacts = [
      {
        createdAt: now,
        id: "12345678-1234-1234-1234-123456789abc",
        name: "landing-page",
        updatedAt: now,
      },
      {
        createdAt: now,
        id: "abcdefab-abcd-abcd-abcd-abcdefabcdef",
        name: "docs",
        updatedAt: now,
      },
    ] as const;

    const table = formatArtifactsTable(artifacts);

    expect(table.split("\n")).toHaveLength(3);
    expect(table).toContain("id");
    expect(table).toContain("name");
    expect(table).toContain("created");
    expect(table).toContain("updated");
    expect(table).toContain("12345678-1234-1234-1234-123456789abc");
    expect(table).toContain("abcdefab-abcd-abcd-abcd-abcdefabcdef");
    expect(table).toContain("landing-page");
    expect(table).toContain("docs");
  });

  test("pads names so date columns stay aligned", () => {
    const now = new Date();
    const table = plainText(
      formatArtifactsTable([
        {
          createdAt: now,
          id: "12345678-1234-1234-1234-123456789abc",
          name: "a",
          updatedAt: now,
        },
        {
          createdAt: now,
          id: "abcdefab-abcd-abcd-abcd-abcdefabcdef",
          name: "much-longer-name",
          updatedAt: now,
        },
      ])
    );

    const [header = "", shortRow = "", longRow = ""] = table.split("\n");

    expect(header.indexOf("created")).toBe(shortRow.indexOf("less than"));
    expect(shortRow.indexOf("less than")).toBe(longRow.indexOf("less than"));
  });
});
