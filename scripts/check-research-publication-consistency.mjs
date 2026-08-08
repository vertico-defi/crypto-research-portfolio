import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { researchStatusFromSnapshot, unsupportedResearchClaims } from "../lib/research-status.mjs";

const readSnapshot = root => JSON.parse(readFileSync(path.join(root, "public", "data", "strategy-snapshot.json"), "utf8"));
const returnFigures = html => [...html.matchAll(/(?:^|[^\w])[+-]?\d+(?:\.\d+)?%/g)].map(match => match[0].trim());

export const checkResearchPublicationConsistency = (root = process.cwd()) => {
  const researchPage = path.join(root, "out", "research", "index.html");
  if (!existsSync(researchPage)) throw new Error("Research page does not exist; run npm run build first.");
  const status = researchStatusFromSnapshot(readSnapshot(root));
  const html = readFileSync(researchPage, "utf8");
  if (!html.includes(status.text)) throw new Error(`Research page does not match the public snapshot status: ${status.code}`);
  for (const claim of unsupportedResearchClaims) if (html.includes(claim)) throw new Error(`Research page contains an unsupported claim: ${claim}`);
  const unexpectedFigures = returnFigures(html).filter(figure => !status.eligibleReturnFigures.includes(figure));
  if (unexpectedFigures.length > 0) throw new Error(`Research page contains return figures not eligible in the public snapshot: ${unexpectedFigures.join(", ")}`);
  return { status: status.code, eligible_return_figures: status.eligibleReturnFigures.length, unsupported_claims: 0 };
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(checkResearchPublicationConsistency()));
