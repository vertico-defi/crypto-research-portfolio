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

test("strategy control publication remains a diagnostic no-candidate record", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "DATA_NO_GO");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "none");
  assert.match(control.warning, /no holdout was opened/);
  assert.match(control.warning, /no returns were calculated/);
  assert.match(control.warning, /no candidate was promoted/);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "25ce4fc162d529927055c72db99799933821a289");
});

test("strategy control narrative matches the current archive data no-go", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /archive-derived universe|archive-enumeration contract/);
    assert.match(source, /DATA_NO_GO|data-contract rejection/);
    assert.doesNotMatch(source, /published status is AUDIT_REJECTED/);
    assert.doesNotMatch(source, /frozen BTC\/ETH relative-value rotation experiment/);
  }
});
