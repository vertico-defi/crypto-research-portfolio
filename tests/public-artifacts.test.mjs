import test from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkStaticOutput } from "../scripts/check-static-output.mjs";
import { checkPublicArtifacts } from "../scripts/check-public-artifacts.mjs";

test("public artifact allowlist excludes LaTeX intermediates", () => {
  assert.doesNotThrow(checkStaticOutput);
  assert.doesNotThrow(checkPublicArtifacts);
});

test("public artifact validation rejects a LaTeX intermediate", () => {
  const fixture = mkdtempSync(path.join(tmpdir(), "public-artifact-fixture-"));
  const publicDownloads = path.join(fixture, "public", "downloads");
  const outDownloads = path.join(fixture, "out", "downloads");
  mkdirSync(publicDownloads, { recursive: true });
  mkdirSync(outDownloads, { recursive: true });
  copyFileSync("public/downloads/why-most-crypto-backtests-lie.pdf", path.join(publicDownloads, "why-most-crypto-backtests-lie.pdf"));
  copyFileSync("public/downloads/why-most-crypto-backtests-lie.pdf", path.join(outDownloads, "why-most-crypto-backtests-lie.pdf"));
  const prohibited = path.join(outDownloads, "lead-magnet-build.log");
  try {
    writeFileSync(prohibited, "/private/runner/path");
    assert.throws(() => checkPublicArtifacts(fixture), /Prohibited LaTeX intermediates/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
  assert.doesNotThrow(checkPublicArtifacts);
});
