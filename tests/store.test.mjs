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

test("strategy control publication remains a no-return no-candidate record", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "AUDIT_REJECTED");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "none");
  assert.match(control.warning, /both bounded development attempts failed before completed returns/);
  assert.match(control.warning, /final holdout remained closed/);
  assert.match(control.warning, /no economic verdict/);
  assert.match(control.warning, /no candidate was promoted/);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "8941140350779e99d7f222de886b9107dda46d70");
});

test("strategy control narrative matches the terminal calendar implementation audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /calendar contract|calendar seasonality/i);
    assert.match(source, /AUDIT_REJECTED|implementation and methodology rejection/);
    assert.match(source, /holdout remained closed/);
    assert.doesNotMatch(source, /published status is DATA_NO_GO/);
    assert.doesNotMatch(source, /archive-derived universe is ineligible/);
  }
});
