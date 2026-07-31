/**
 * Read-only publication safety scan.  It records counts and dispositions, not
 * matching content, so the audit itself cannot exfiltrate a credential.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const workspace = process.env.CRYPTO_RESEARCH_WORKSPACE || path.resolve(process.cwd(), "..");
const projects = [
  ["direction-v3", path.join(workspace, "crypto-direction-lab")],
  ["perp-carry", path.join(workspace, "perp-carry-lab")],
  ["ctrend", path.join(workspace, "ctrend-lab")],
  ["strategy-control", path.join(workspace, "crypto-strategy-control")],
];
const patterns = [
  "AKIA[0-9A-Z]{16}",
  "-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----",
  "(api[_-]?key|secret|token|password|wallet|seed)[[:space:]]*[:=]",
];
const run = (repo, args) => {
  try { return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).trim(); }
  catch (error) { return { error: String(error.message).split("\n")[0] }; }
};
const lineCount = value => typeof value === "string" && value ? value.split("\n").filter(Boolean).length : 0;
const audit = projects.map(([id, repo]) => {
  const currentHits = patterns.map(pattern => lineCount(run(repo, ["grep", "-nEI", "-e", pattern])));
  const historyHits = patterns.map(pattern => lineCount(run(repo, ["log", "--all", "--format=%H", "-G", pattern])));
  const largeObjects = run(repo, ["rev-list", "--objects", "--all"]);
  // A blob-size census needs every object inspection; retain only the total object count here.
  const result = {
    project: id,
    scanned_refs: "--all",
    current_tree_match_counts: currentHits,
    history_commit_match_counts: historyHits,
    object_reference_count: lineCount(largeObjects),
    scan_status: currentHits.some(Boolean) || historyHits.some(Boolean) ? "REQUIRES_MANUAL_REMEDIATION" : "NO_PATTERN_MATCHES",
    publication_decision: "SANITIZED_SHOWCASE_REQUIRED",
    reason: "Regex scans cannot establish data rights, remove raw data, or prove history safety. Never publish the laboratory repository directly.",
  };
  return result;
});
const payload = {
  generated_at: new Date().toISOString(),
  scope: "all reachable git history and current tracked tree",
  limitations: [
    "Pattern scans are a safety control, not a proof that no secret or restricted data exists.",
    "No matching line contents, paths, or secret candidates are written to this report.",
    "A new sanitized repository must be reviewed independently before publication.",
  ],
  projects: audit,
};
mkdirSync("audits", { recursive: true });
writeFileSync(path.join("audits", "publication_history_scan.json"), JSON.stringify(payload, null, 2) + "\n");
writeFileSync(path.join("audits", "publication_history_scan.md"), "# Publication history scan\n\n" + audit.map(item => `- ${item.project}: ${item.scan_status}; ${item.publication_decision}; current=${item.current_tree_match_counts.join(",")}; history=${item.history_commit_match_counts.join(",")}.`).join("\n") + "\n\nNo laboratory source repository is approved for direct publication.\n");
console.log(JSON.stringify({ projects: audit.length, statuses: audit.map(x => x.scan_status) }));
