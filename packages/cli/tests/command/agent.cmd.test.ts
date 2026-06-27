import { describe, expect, test } from "bun:test";

import { readCoreSkill } from "../../src/command/agent.cmd";

describe("readCoreSkill", () => {
  test("reads the packaged core agent skill", async () => {
    const coreSkill = await readCoreSkill();

    expect(coreSkill).toContain("# Artifacts CLI Core Skill");
    expect(coreSkill).toContain("artifacts upload");
    expect(coreSkill).toContain("artifacts agent get core");
  });
});
