import test from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkLeadMagnetCommitted } from "../scripts/check-lead-magnet-committed.mjs";
import { checkLeadMagnetRepro } from "../scripts/check-lead-magnet-repro.mjs";

const committedPdf = "public/downloads/why-most-crypto-backtests-lie.pdf";

test("lead-magnet source is reproducible and matches the committed PDF without modifying it", () => {
  const before = readFileSync(committedPdf);
  const repro = checkLeadMagnetRepro();
  const committed = checkLeadMagnetCommitted();
  assert.equal(repro.match, true);
  assert.equal(committed.match, true);
  assert.equal(committed.candidate_sha256, committed.committed_sha256);
  assert.deepEqual(readFileSync(committedPdf), before);
});

test("committed-artifact verification rejects an altered temporary fixture", () => {
  const fixture = mkdtempSync(path.join(tmpdir(), "lead-magnet-fixture-"));
  const alteredPdf = path.join(fixture, "why-most-crypto-backtests-lie.pdf");
  try {
    copyFileSync(committedPdf, alteredPdf);
    writeFileSync(alteredPdf, "fixture mismatch", { flag: "a" });
    assert.throws(() => checkLeadMagnetCommitted({ publishedPdf: alteredPdf }), /does not match deterministic source build/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
