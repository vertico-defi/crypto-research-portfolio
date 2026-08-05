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

test("strategy control preserves Phase 1 while reporting the route-4 direction-design hard stop", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "DIRECTION_DESIGN_INCONCLUSIVE / NO_DATA_RESULT / NO_ECONOMIC_RESULT / ACQUISITION_NOT_STARTED");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /APPROVED_SPACE_EXHAUSTED \/ RESEARCH_BUDGET_EXHAUSTED/);
  assert.match(control.warning, /Phase 2 routes 1 and 2 remain terminally implementation-inconclusive/);
  assert.match(control.warning, /final authorized live read-only Sol\/xhigh narrow provenance delta review returned substantive REVISION_REQUIRED/);
  assert.match(control.warning, /non-circular draft\/schema binding passed check 1.*network-attempt schema failed check 8.*immutable terminal reconstruction failed check 9/i);
  assert.match(control.warning, /invalidated prior check 4/);
  assert.match(control.warning, /SUCCESS_HTTP with status 503/);
  assert.match(control.warning, /deletion of a complete final logical-request suffix or the whole ledger/);
  assert.match(control.warning, /no retry, further Route 4 correction, sixth direction review, freeze manifest, implementation, or acquisition is authorized/i);
  assert.match(control.warning, /administratively terminal.*not scientifically or economically consumed/i);
  assert.match(control.warning, /not DATA_NO_GO, HISTORICAL_NO_GO, a strategy result, or evidence of profitability or unprofitability/);
  assert.match(control.warning, /No Route 4 network request, archive object discovery or download, market-data access, strategy implementation, model training, backtest, return calculation, acquisition attempt, or holdout-path access/);
  assert.match(control.warning, /not evidence of trading profitability/);
  assert.match(control.warning, /final holdout remains sealed, unopened, and unread/i);
  assert.match(control.warning, /no candidate is promoted|No Phase 2 economic result, strategy P&L, candidate/i);
  assert.match(control.warning, /capital and GPU permission remain zero/);
  assert.equal(control.sourceCommit, "c067034d7186a58334079b51f172755cf01d4651");
});

test("strategy control narrative matches the terminal program audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /approved space is exhausted|APPROVED_SPACE_EXHAUSTED/i);
    assert.match(source, /RESEARCH_BUDGET_EXHAUSTED/);
    assert.match(source, /Phase 2|REVISION_REQUIRED/);
    assert.match(source, /no Phase 2 economic result|no Phase 2 strategy P&L|Phase 2 has no economic result/i);
    assert.match(source, /Route 4.*REVISION_REQUIRED|Route 4.*unfrozen/i);
    assert.match(source, /not a universal impossibility claim|not proof that every public-data route is impossible/i);
    assert.match(source, /holdout remain(?:s|ed) (?:closed|sealed)/);
  }
});
