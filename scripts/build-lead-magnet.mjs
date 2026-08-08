import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runTex } from "./lead-magnet-toolchain.mjs";

const root = process.cwd();
const source = path.join(root, "content", "lead-magnet", "why-most-crypto-backtests-lie.tex");
const filename = "why-most-crypto-backtests-lie.pdf";

export const buildLeadMagnet = ({ outputDirectory = path.join(root, ".build", "lead-magnet"), publish = true } = {}) => {
  rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });
  for (let pass = 0; pass < 2; pass += 1) {
    runTex({
      mounts: [{ host: root }, { host: outputDirectory }],
      command: ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", "-output-directory", outputDirectory, source],
    });
  }
  const builtPdf = path.join(outputDirectory, filename);
  if (!existsSync(builtPdf)) throw new Error("Lead-magnet PDF was not produced.");
  if (publish) {
    const downloads = path.join(root, "public", "downloads");
    mkdirSync(downloads, { recursive: true });
    copyFileSync(builtPdf, path.join(downloads, filename));
  }
  return builtPdf;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) buildLeadMagnet();
