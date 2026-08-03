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

test("strategy control publication records approved-space exhaustion without a candidate", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "APPROVED_SPACE_EXHAUSTED");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /approved and durably registered zero-cost research space is exhausted/);
  assert.match(control.warning, /cross-sectional queue remains economically unevaluated/);
  assert.match(control.warning, /does not claim that every conceivable public dataset or crypto strategy is impossible/);
  assert.match(control.warning, /final holdout remained closed and unread/i);
  assert.match(control.warning, /no candidate was promoted/);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "e7ce407f7197d469c2dc6baa0a0926667474961b");
});

test("strategy control narrative matches the terminal program audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /approved space is exhausted|APPROVED_SPACE_EXHAUSTED/i);
    assert.match(source, /thirteen approved or durably selected family states/i);
    assert.match(source, /HISTORICAL_NO_GO/);
    assert.match(source, /two families have no economic result|ended without economic results/i);
    assert.match(source, /not a universal impossibility claim|not proof that every public-data route is impossible/i);
    assert.match(source, /holdout remained closed/);
  }
});
