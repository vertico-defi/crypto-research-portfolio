import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { researchStatusFromSnapshot } from "../lib/research-status.mjs";
import { checkResearchPublicationConsistency } from "../scripts/check-research-publication-consistency.mjs";

const statusNotReached = "The current public evidence snapshot reports that one clean development economic result has not yet been reached.";
const fixtureSnapshot = verdict => ({ strategies: [{ id: "strategy-control", verdict }] });
const createFixture = ({ snapshot, body }) => {
  const root = mkdtempSync(path.join(tmpdir(), "research-publication-fixture-"));
  mkdirSync(path.join(root, "public", "data"), { recursive: true });
  mkdirSync(path.join(root, "out", "research"), { recursive: true });
  writeFileSync(path.join(root, "public", "data", "strategy-snapshot.json"), JSON.stringify(snapshot));
  writeFileSync(path.join(root, "out", "research", "index.html"), `<!doctype html><p>${body}</p>`);
  return root;
};

test("generated research page reflects the snapshot-supported current status", () => {
  const html = readFileSync("out/research/index.html", "utf8");
  assert.match(html, new RegExp(statusNotReached));
  assert.doesNotMatch(html, /complete development evaluation was produced/i);
  assert.doesNotThrow(checkResearchPublicationConsistency);
});

test("research consistency validation follows fixture snapshot status and fails closed on contradictory claims", () => {
  const changedSnapshot = fixtureSnapshot("ALTERNATE_PUBLIC_STATUS");
  const changedStatus = researchStatusFromSnapshot(changedSnapshot).text;
  const validFixture = createFixture({ snapshot: changedSnapshot, body: changedStatus });
  const contradictoryFixture = createFixture({ snapshot: fixtureSnapshot("ONE_CLEAN_DEVELOPMENT_RESULT_NOT_REACHED"), body: "Complete development evaluation produced. +20.7611%" });
  const syncFixture = createFixture({ snapshot: fixtureSnapshot("ONE_CLEAN_DEVELOPMENT_RESULT_NOT_REACHED"), body: `${statusNotReached} A newer source checkpoint is awaiting sanitized publication synchronization.` });
  const returnFixture = createFixture({ snapshot: fixtureSnapshot("ONE_CLEAN_DEVELOPMENT_RESULT_NOT_REACHED"), body: `${statusNotReached} +20.7611%` });
  try {
    assert.equal(changedStatus, "The current public evidence snapshot reports Strategy Control status: ALTERNATE_PUBLIC_STATUS.");
    assert.doesNotThrow(() => checkResearchPublicationConsistency(validFixture));
    assert.doesNotThrow(() => checkResearchPublicationConsistency(syncFixture));
    assert.throws(() => checkResearchPublicationConsistency(contradictoryFixture), /does not match the public snapshot status/);
    assert.throws(() => checkResearchPublicationConsistency(returnFixture), /return figures not eligible/);
  } finally {
    rmSync(validFixture, { recursive: true, force: true });
    rmSync(contradictoryFixture, { recursive: true, force: true });
    rmSync(syncFixture, { recursive: true, force: true });
    rmSync(returnFixture, { recursive: true, force: true });
  }
  assert.equal(existsSync(validFixture), false);
  assert.equal(existsSync(contradictoryFixture), false);
  assert.equal(existsSync(syncFixture), false);
  assert.equal(existsSync(returnFixture), false);
});
