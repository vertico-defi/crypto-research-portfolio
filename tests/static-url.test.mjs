import test from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
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

const digest = file => createHash("sha256").update(readFileSync(file)).digest("hex");

test("static validation rejects malformed trailing-slash asset URLs in an isolated fixture", () => {
  const fixture = mkdtempSync(path.join(tmpdir(), "static-url-fixture-"));
  const resourcePath = path.join(fixture, "out", "resources", "index.html");
  const downloadPath = path.join(fixture, "out", "download", "index.html");
  const realResourcePath = "out/resources/index.html";
  const realDownloadPath = "out/download/index.html";
  const realState = [realResourcePath, realDownloadPath].map(file => ({ file, hash: digest(file), mtime: statSync(file).mtimeMs }));
  cpSync("out", path.join(fixture, "out"), { recursive: true });
  const resources = readFileSync(resourcePath, "utf8");
  const download = readFileSync(downloadPath, "utf8");
  try {
    writeFileSync(resourcePath, resources.replace("why-most-crypto-backtests-lie-cover.svg\"", "why-most-crypto-backtests-lie-cover.svg/\""));
    assert.throws(() => checkStaticOutput(fixture), /Broken local link.*\.svg\//);
    writeFileSync(resourcePath, resources);
    writeFileSync(downloadPath, download.replace("why-most-crypto-backtests-lie.pdf\"", "why-most-crypto-backtests-lie.pdf/\""));
    assert.throws(() => checkStaticOutput(fixture), /Broken local link.*\.pdf\//);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
  assert.equal(existsSync(fixture), false);
  for (const item of realState) {
    assert.equal(digest(item.file), item.hash, item.file);
    assert.equal(statSync(item.file).mtimeMs, item.mtime, item.file);
  }
  assert.doesNotThrow(checkStaticOutput);
});
