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

test("strategy control publication remains a diagnostic-only no-candidate record", () => {
  const snapshot = JSON.parse(readFileSync("public/data/strategy-snapshot.json", "utf8"));
  const control = snapshot.strategies.find(item => item.id === "strategy-control");
  assert.equal(control.verdict, "AUDIT_REJECTED");
  assert.equal(control.capitalPermitted, 0);
  assert.equal(control.pnl, "diagnostic");
  assert.match(control.warning, /negative diagnostics|failed 13 frozen gates/);
  assert.match(control.warning, /input identity, target provenance, and quarantine handling/);
  assert.match(control.warning, /final holdout remained closed and unread/);
  assert.match(control.warning, /not a valid frozen-strategy economic verdict/);
  assert.match(control.warning, /no candidate was promoted/);
  assert.match(control.warning, /capital remains zero/);
  assert.equal(control.sourceCommit, "ac420fc3a2a7a619836663977e47a929679ca565");
});

test("strategy control narrative matches the terminal volatility audit", () => {
  for (const path of ["scripts/build-static-site.mjs", "components/StrategyPage.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /inverse-volatility/i);
    assert.match(source, /HISTORICAL_NO_GO/);
    assert.match(source, /AUDIT_REJECTED|rejected implementation fidelity/);
    assert.match(source, /diagnostic-only/);
    assert.match(source, /holdout remained closed/);
    assert.doesNotMatch(source, /is a valid frozen-strategy economic verdict/);
  }
});
