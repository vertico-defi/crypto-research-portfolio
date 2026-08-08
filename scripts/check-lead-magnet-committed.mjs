import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildLeadMagnet } from "./build-lead-magnet.mjs";

const root = process.cwd();
const filename = "why-most-crypto-backtests-lie.pdf";
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");

export const checkLeadMagnetCommitted = ({ publishedPdf = path.join(root, "public", "downloads", filename) } = {}) => {
  if (!existsSync(publishedPdf)) throw new Error(`Committed lead-magnet PDF is missing: ${publishedPdf}`);
  const buildDirectory = mkdtempSync(path.join(tmpdir(), "lead-magnet-committed-"));
  try {
    const candidatePdf = buildLeadMagnet({ outputDirectory: buildDirectory, publish: false });
    const candidateHash = hash(candidatePdf);
    const committedHash = hash(publishedPdf);
    if (candidateHash !== committedHash) throw new Error(`Committed lead-magnet PDF does not match deterministic source build: ${committedHash} != ${candidateHash}`);
    return { candidate_sha256: candidateHash, committed_sha256: committedHash, match: true };
  } finally {
    rmSync(buildDirectory, { recursive: true, force: true });
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(checkLeadMagnetCommitted()));
