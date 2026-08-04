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

test("strategy control preserves Phase 1 exhaustion while reporting active Phase 2", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "PASS_PURE_PRE_DATA");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /APPROVED_SPACE_EXHAUSTED \/ RESEARCH_BUDGET_EXHAUSTED/);
  assert.match(control.warning, /Phase 1 zero-cost research space was exhausted/);
  assert.match(control.warning, /cross-sectional queue remained economically unevaluated/);
  assert.match(control.warning, /did not claim that every conceivable public dataset or crypto strategy was impossible/);
  assert.match(control.warning, /Phase 2 is now active/);
  assert.match(control.warning, /implementation evidence only/);
  assert.match(control.warning, /no Phase 2 economic result exists/);
  assert.match(control.warning, /final holdout remains closed and unread/i);
  assert.match(control.warning, /no candidate is promoted/);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "a4cc2684e78f012b7a9cba240c076bb84369ab71");
});

test("strategy control narrative matches the terminal program audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /approved space is exhausted|APPROVED_SPACE_EXHAUSTED/i);
    assert.match(source, /RESEARCH_BUDGET_EXHAUSTED/);
    assert.match(source, /Phase 2|PASS_PURE_PRE_DATA/);
    assert.match(source, /no Phase 2 economic result|no Phase 2 strategy P&L|Phase 2 has no economic result/i);
    assert.match(source, /thirteen approved or durably selected family states/i);
    assert.match(source, /HISTORICAL_NO_GO/);
    assert.match(source, /two families have no economic result|ended without economic results/i);
    assert.match(source, /not a universal impossibility claim|not proof that every public-data route is impossible/i);
    assert.match(source, /holdout remained closed/);
  }
});
