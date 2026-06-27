import { describe, expect, test } from "bun:test";

import { BunServices } from "@effect/platform-bun";
import * as Effect from "effect/Effect";

import { readCoreSkill } from "../../src/command/agent.cmd";

describe("readCoreSkill", () => {
  test("reads the packaged core agent skill", async () => {
    const coreSkill = await Effect.runPromise(
      readCoreSkill().pipe(Effect.provide(BunServices.layer))
    );

    expect(coreSkill).toContain("# Artifacts CLI Core Skill");
    expect(coreSkill).toContain("artifacts upload");
    expect(coreSkill).toContain("artifacts agent get core");
  });
});
