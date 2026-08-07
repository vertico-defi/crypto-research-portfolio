import test from "node:test";
import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { checkStaticOutput } from "../scripts/check-static-output.mjs";
import { checkPublicArtifacts } from "../scripts/check-public-artifacts.mjs";

test("public artifact allowlist excludes LaTeX intermediates", () => {
  assert.doesNotThrow(checkStaticOutput);
  assert.doesNotThrow(checkPublicArtifacts);
});

test("public artifact validation rejects a LaTeX intermediate", () => {
  const prohibited = "out/downloads/lead-magnet-build.log";
  try {
    writeFileSync(prohibited, "/private/runner/path");
    assert.throws(checkPublicArtifacts, /Prohibited LaTeX intermediates/);
  } finally {
    rmSync(prohibited, { force: true });
  }
  assert.doesNotThrow(checkPublicArtifacts);
});
