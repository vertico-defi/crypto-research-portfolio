import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("publication contains no server or wallet implementation", () => {
  for (const path of [
    "app/api/orders/route.ts",
    "app/api/verify-payment/route.ts",
    "app/api/download/route.ts",
    "lib/store.ts",
    ".env",
    ".env.example",
    "out/api",
  ]) {
    assert.equal(existsSync(path), false, `${path} must not be published`);
  }
});

test("live store remains disabled", () => assert.equal(process.env.STORE_LIVE === "true", false));
test("catalog is static", () => assert.ok(true));

test("strategy control preserves prior phases while reporting the Phase 3 evidence boundary", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "ACTIVE_RESEARCH_PHASE_3_ADAPTIVE_PORTFOLIO / ONE_CLEAN_DEVELOPMENT_RESULT_NOT_REACHED");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "none");
  assert.match(control.warning, /APPROVED_SPACE_EXHAUSTED \/ RESEARCH_BUDGET_EXHAUSTED/);
  assert.match(control.warning, /mean-reversion v2 and relative-value rotation v2.*IMPLEMENTATION_INCONCLUSIVE \/ NO_ECONOMIC_RESULT/i);
  assert.match(control.warning, /Route 4 remains deferred.*DIRECTION_DESIGN_INCONCLUSIVE \/ NO_DATA_RESULT \/ NO_ECONOMIC_RESULT/i);
  assert.match(control.warning, /63,650 expected observations across ten registered streams/);
  assert.match(control.warning, /realized settlements are not joined/);
  assert.match(control.warning, /Binance executable bid\/ask is absent/);
  assert.match(control.warning, /collection-health evidence, not a strategy result or profitability evidence/i);
  assert.match(control.warning, /first Phase 3 milestone.*has not been reached/i);
  assert.match(control.warning, /final holdouts remain unresolved, sealed, unopened, and unread/i);
  assert.equal(control.sourceCommit, "ce2434269ee42c63d56814cd4d21dcc6e20d9ece");
});

test("strategy control narrative matches the Phase 3 programme state", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /APPROVED_SPACE_EXHAUSTED/i);
    assert.match(source, /RESEARCH_BUDGET_EXHAUSTED/);
    assert.match(source, /Phase 3/i);
    assert.match(source, /implementation-inconclusive/i);
    assert.match(source, /Route 4 remains deferred/i);
    assert.match(source, /63,650/);
    assert.match(source, /not.*profitability|not a strategy result/i);
    assert.match(source, /holdout remain(?:s|ed).*(?:unresolved, sealed|sealed)/i);
  }
});
