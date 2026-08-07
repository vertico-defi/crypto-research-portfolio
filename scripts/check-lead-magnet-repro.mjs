import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildLeadMagnet } from "./build-lead-magnet.mjs";

const root = process.cwd();
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const first = buildLeadMagnet({ outputDirectory: path.join(root, ".build", "lead-magnet-repro-a"), publish: false });
const second = buildLeadMagnet({ outputDirectory: path.join(root, ".build", "lead-magnet-repro-b"), publish: false });
const firstHash = hash(first);
const secondHash = hash(second);
if (firstHash !== secondHash) throw new Error(`Lead-magnet PDF is not reproducible: ${firstHash} != ${secondHash}`);
const published = path.join(root, "public", "downloads", "why-most-crypto-backtests-lie.pdf");
if (!existsSync(published) || hash(published) !== firstHash) throw new Error("Committed public PDF does not match the deterministic build output.");
console.log(JSON.stringify({ first_sha256: firstHash, second_sha256: secondHash, match: true }));
