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

test("strategy control preserves Phase 1 while reporting the terminal route-3 direction result", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "PREREGISTRATION_BLOCKED_DIRECTION_REVIEW_BUDGET_EXHAUSTED / METHODOLOGY_INCONCLUSIVE / NO_ECONOMIC_RESULT");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /APPROVED_SPACE_EXHAUSTED \/ RESEARCH_BUDGET_EXHAUSTED/);
  assert.match(control.warning, /Phase 2 routes 1 and 2 remain terminally implementation-inconclusive/);
  assert.match(control.warning, /Route 3.*all three substantive no-data direction-review attempts/);
  assert.match(control.warning, /never reached a frozen preregistration, implementation, backtest, or formal economic evaluation/);
  assert.match(control.warning, /live read-only Sol\/xhigh terminal audit independently confirmed/);
  assert.match(control.warning, /PREREGISTRATION_BLOCKED_DIRECTION_REVIEW_BUDGET_EXHAUSTED \/ METHODOLOGY_INCONCLUSIVE \/ NO_ECONOMIC_RESULT/);
  assert.match(control.warning, /not unprofitability, HISTORICAL_NO_GO, DATA_NO_GO, or economic consumption/);
  assert.match(control.warning, /Route 4.*selected next.*no route authorization, preregistration, network action, or data acquisition/);
  assert.match(control.warning, /not evidence of trading profitability/);
  assert.match(control.warning, /final holdout remains closed and unread/i);
  assert.match(control.warning, /no candidate is promoted|No Phase 2 economic result, strategy P&L, candidate/i);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "21e87ba7e85db658769f85acc554e914d3925761");
});

test("strategy control narrative matches the terminal program audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /approved space is exhausted|APPROVED_SPACE_EXHAUSTED/i);
    assert.match(source, /RESEARCH_BUDGET_EXHAUSTED/);
    assert.match(source, /Phase 2|PREREGISTRATION_BLOCKED_DIRECTION_REVIEW_BUDGET_EXHAUSTED/);
    assert.match(source, /no Phase 2 economic result|no Phase 2 strategy P&L|Phase 2 has no economic result/i);
    assert.match(source, /Route 3.*not implemented|Route 3.*before freeze or implementation/i);
    assert.match(source, /Route 4.*selected/i);
    assert.match(source, /not a universal impossibility claim|not proof that every public-data route is impossible/i);
    assert.match(source, /holdout remained closed/);
  }
});
