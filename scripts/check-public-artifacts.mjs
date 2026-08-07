import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const prohibited = /\.(aux|log|out|toc|fls|fdb_latexmk|synctex\.gz|bbl|blg|dvi|xdv|lof|lot|nav|snm|vrb)$/i;
const visit = directory => existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? visit(path.join(directory, entry.name)) : [path.join(directory, entry.name)]) : [];
export const checkPublicArtifacts = (root = process.cwd()) => {
  const offenders = ["public", "out"].flatMap(directory => visit(path.join(root, directory))).filter(file => prohibited.test(file));
  if (offenders.length) throw new Error(`Prohibited LaTeX intermediates in public output: ${offenders.join(", ")}`);
  const publicDownloads = visit(path.join(root, "public", "downloads")).map(file => path.basename(file)).filter(file => file !== ".gitkeep");
  if (publicDownloads.length !== 1 || publicDownloads[0] !== "why-most-crypto-backtests-lie.pdf") throw new Error(`Unexpected public downloads: ${publicDownloads.join(", ")}`);
  const outDownloads = visit(path.join(root, "out", "downloads")).map(file => path.basename(file));
  if (outDownloads.length !== 1 || outDownloads[0] !== "why-most-crypto-backtests-lie.pdf") throw new Error(`Unexpected published downloads: ${outDownloads.join(", ")}`);
  return { prohibited_latex_intermediates: 0, public_download_allowlist: publicDownloads, out_download_allowlist: outDownloads };
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(checkPublicArtifacts()));
