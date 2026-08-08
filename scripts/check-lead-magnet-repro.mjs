import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildLeadMagnet } from "./build-lead-magnet.mjs";

const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");

export const checkLeadMagnetRepro = () => {
  const firstDirectory = mkdtempSync(path.join(tmpdir(), "lead-magnet-repro-a-"));
  const secondDirectory = mkdtempSync(path.join(tmpdir(), "lead-magnet-repro-b-"));
  try {
    const first = buildLeadMagnet({ outputDirectory: firstDirectory, publish: false });
    const second = buildLeadMagnet({ outputDirectory: secondDirectory, publish: false });
    const firstHash = hash(first);
    const secondHash = hash(second);
    if (firstHash !== secondHash) throw new Error(`Lead-magnet PDF is not reproducible: ${firstHash} != ${secondHash}`);
    return { first_sha256: firstHash, second_sha256: secondHash, match: true };
  } finally {
    rmSync(firstDirectory, { recursive: true, force: true });
    rmSync(secondDirectory, { recursive: true, force: true });
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(checkLeadMagnetRepro()));
