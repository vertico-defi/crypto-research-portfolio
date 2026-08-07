import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { checkStaticOutput } from "../scripts/check-static-output.mjs";

const base = "/crypto-research-portfolio";
test("static URLs preserve exact asset filenames and page canonical URLs", () => {
  const home = readFileSync("out/index.html", "utf8");
  const resources = readFileSync("out/resources/index.html", "utf8");
  const download = readFileSync("out/download/index.html", "utf8");
  const pdf = `${base}/downloads/why-most-crypto-backtests-lie.pdf`;
  const svg = `${base}/assets/why-most-crypto-backtests-lie-cover.svg`;

  assert.match(home, new RegExp(`href="${base}/"`));
  assert.match(home, new RegExp(`href="${base}/research/"`));
  assert.match(home, new RegExp(`href="${base}/assets/site\\.css"`));
  assert.match(resources, new RegExp(`src="${svg}"`));
  assert.match(download, new RegExp(`href="${pdf}"`));
  assert.doesNotMatch(resources, /\.svg\//);
  assert.doesNotMatch(download, /\.pdf\//);
  assert.equal(existsSync(`out/assets/why-most-crypto-backtests-lie-cover.svg`), true);
  assert.equal(existsSync(`out/downloads/why-most-crypto-backtests-lie.pdf`), true);
  assert.doesNotThrow(checkStaticOutput);
});

test("static validation rejects malformed trailing-slash asset URLs", () => {
  const resourcePath = "out/resources/index.html";
  const downloadPath = "out/download/index.html";
  const resources = readFileSync(resourcePath, "utf8");
  const download = readFileSync(downloadPath, "utf8");
  try {
    writeFileSync(resourcePath, resources.replace("why-most-crypto-backtests-lie-cover.svg\"", "why-most-crypto-backtests-lie-cover.svg/\""));
    assert.throws(checkStaticOutput, /Broken local link.*\.svg\//);
    writeFileSync(resourcePath, resources);
    writeFileSync(downloadPath, download.replace("why-most-crypto-backtests-lie.pdf\"", "why-most-crypto-backtests-lie.pdf/\""));
    assert.throws(checkStaticOutput, /Broken local link.*\.pdf\//);
  } finally {
    writeFileSync(resourcePath, resources);
    writeFileSync(downloadPath, download);
  }
  assert.doesNotThrow(checkStaticOutput);
});
