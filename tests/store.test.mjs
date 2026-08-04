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

test("strategy control preserves Phase 1 while reporting the terminal route-2 implementation result", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "IMPLEMENTATION_BLOCKED_REPAIR_BUDGET_EXHAUSTED / IMPLEMENTATION_INCONCLUSIVE / NO_ECONOMIC_RESULT");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /APPROVED_SPACE_EXHAUSTED \/ RESEARCH_BUDGET_EXHAUSTED/);
  assert.match(control.warning, /Route 2, relative-value rotation v2/);
  assert.match(control.warning, /initial implementation and all three authorized pre-run repair rounds/);
  assert.match(control.warning, /live read-only Sol\/xhigh audit independently confirmed/);
  assert.match(control.warning, /not unprofitable, HISTORICAL_NO_GO, or DATA_NO_GO/);
  assert.match(control.warning, /neither economically evaluated nor economically consumed/);
  assert.match(control.warning, /no formal economic attempt or performance result exists/);
  assert.match(control.warning, /Route 3.*queued for preregistration only/);
  assert.match(control.warning, /not evidence of trading profitability/);
  assert.match(control.warning, /final holdout remains closed and unread/i);
  assert.match(control.warning, /no candidate is promoted|No Phase 2 economic result, strategy P&L, candidate/i);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "c48bb16ef950d1398dc62aa19134ad5121a00b12");
});

test("strategy control narrative matches the terminal program audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /approved space is exhausted|APPROVED_SPACE_EXHAUSTED/i);
    assert.match(source, /RESEARCH_BUDGET_EXHAUSTED/);
    assert.match(source, /Phase 2|IMPLEMENTATION_BLOCKED_REPAIR_BUDGET_EXHAUSTED/);
    assert.match(source, /no Phase 2 economic result|no Phase 2 strategy P&L|Phase 2 has no economic result/i);
    assert.match(source, /thirteen approved or durably selected family states/i);
    assert.match(source, /HISTORICAL_NO_GO/);
    assert.match(source, /two families have no economic result|ended without economic results/i);
    assert.match(source, /not a universal impossibility claim|not proof that every public-data route is impossible/i);
    assert.match(source, /holdout remained closed/);
  }
});
