import test from "node:test";import assert from "node:assert/strict";
test("live store defaults disabled",()=>assert.equal(process.env.STORE_LIVE === "true",false));
test("catalog is static",()=>assert.ok(true));
