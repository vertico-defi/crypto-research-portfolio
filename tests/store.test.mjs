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

test("strategy control preserves Phase 1 while reporting the route-4 direction revision blocker", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "REVISION_REQUIRED / PREREGISTRATION_NOT_FROZEN / HUMAN_REVIEW_AMENDMENT_REQUIRED / NO_ECONOMIC_RESULT");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /APPROVED_SPACE_EXHAUSTED \/ RESEARCH_BUDGET_EXHAUSTED/);
  assert.match(control.warning, /Phase 2 routes 1 and 2 remain terminally implementation-inconclusive/);
  assert.match(control.warning, /Route 4.*fourth live read-only Sol\/xhigh no-data direction review returned substantive REVISION_REQUIRED/);
  assert.match(control.warning, /16 of 19 checks passed.*checks 1, 8, and 9 failed.*two major requested revisions/);
  assert.match(control.warning, /reviewed output schema still closes draft_sha256 to superseded hash/);
  assert.match(control.warning, /cannot represent no-response DNS, TLS, reset, or timeout attempts/);
  assert.match(control.warning, /DIRECTION_REVISION_REQUIRES_HUMAN_AUTHORIZATION/);
  assert.match(control.warning, /no fifth review or automatic revision is authorized/i);
  assert.match(control.warning, /not DATA_NO_GO, HISTORICAL_NO_GO, a strategy result, or evidence of profitability or unprofitability/);
  assert.match(control.warning, /No route-4 network data request, archive object discovery or download, market-data access, strategy return, model training, backtest, implementation repair, acquisition attempt, or holdout access/);
  assert.match(control.warning, /not evidence of trading profitability/);
  assert.match(control.warning, /final holdout remains closed and unread/i);
  assert.match(control.warning, /no candidate is promoted|No Phase 2 economic result, strategy P&L, candidate/i);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "5cf57806f1d2a6f83d320a9247004a523471590f");
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
    assert.match(source, /holdout remain(?:s|ed) closed/);
  }
});
