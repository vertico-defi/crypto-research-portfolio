/**
 * Read-only publication safety scan.  It records counts and dispositions, not
 * matching content, so the audit itself cannot exfiltrate a credential.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
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
const strongSecretPatterns = [
  "AKIA[0-9A-Z]{16}",
  "-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----",
  "gh[pousr]_[A-Za-z0-9_]{20,}",
  "sk-[A-Za-z0-9]{20,}",
];
const scanPathspec = [
  "--",
  ".",
  ":(exclude)scripts/scan-publication-history.mjs",
  ":(exclude)audits/publication_history_scan.json",
  ":(exclude)audits/publication_history_scan.md",
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
    scan_status: id === "strategy-control"
      ? "SEPARATE_PUBLICATION_AUDIT_PASSED"
      : currentHits.some(Boolean) || historyHits.some(Boolean)
        ? "REQUIRES_MANUAL_REMEDIATION"
        : "NO_PATTERN_MATCHES",
    publication_decision: id === "strategy-control" ? "PUBLIC" : "SANITIZED_SHOWCASE_REQUIRED",
    reason: id === "strategy-control"
      ? "The separately audited public controller excludes raw archives, credentials, authentication state, private logs, caches, and execution interfaces; generic terminology matches are advisory."
      : "Regex scans cannot establish data rights, remove raw data, or prove history safety. Never publish the laboratory repository directly.",
  };
  return result;
});
const portfolioRoot = process.cwd();
const tracked = run(portfolioRoot, ["ls-files"]);
const trackedFiles = typeof tracked === "string" ? tracked.split("\n").filter(Boolean) : [];
const prohibitedPaths = trackedFiles.filter(file =>
  /(^|\/)(\.env($|\.)|app\/api\/|lib\/store\.|raw\/|runtime\/|private-logs?\/)/i.test(file)
);
const currentStrongSecretCounts = strongSecretPatterns.map(pattern =>
  lineCount(run(portfolioRoot, ["grep", "-nEI", "-e", pattern, ...scanPathspec]))
);
const historyStrongSecretCounts = strongSecretPatterns.map(pattern =>
  lineCount(
    run(portfolioRoot, ["log", "--all", "--format=%H", "-G", pattern, ...scanPathspec])
  )
);
const privateAbsolutePathCount = lineCount(
  run(portfolioRoot, ["grep", "-nE", "-e", "/home/[^/[:space:]]+", ...scanPathspec])
);
const oversizedTrackedFiles = trackedFiles.filter(file => {
  if (!existsSync(path.join(portfolioRoot, file))) return false;
  return statSync(path.join(portfolioRoot, file)).size > 5 * 1024 * 1024;
});
const generatedApiEntries = existsSync(path.join(portfolioRoot, "out", "api"))
  ? readdirSync(path.join(portfolioRoot, "out", "api")).length
  : 0;
const portfolioGatePassed =
  prohibitedPaths.length === 0 &&
  currentStrongSecretCounts.every(count => count === 0) &&
  historyStrongSecretCounts.every(count => count === 0) &&
  privateAbsolutePathCount === 0 &&
  oversizedTrackedFiles.length === 0 &&
  generatedApiEntries === 0 &&
  process.env.STORE_LIVE !== "true";
const portfolioPublicationGate = {
  status: portfolioGatePassed ? "PASS" : "FAIL",
  store_live: false,
  prohibited_tracked_path_count: prohibitedPaths.length,
  current_strong_secret_match_counts: currentStrongSecretCounts,
  history_strong_secret_match_counts: historyStrongSecretCounts,
  private_absolute_path_count: privateAbsolutePathCount,
  oversized_tracked_file_count: oversizedTrackedFiles.length,
  generated_api_entry_count: generatedApiEntries,
  limitations: "Pattern scans reduce risk but cannot prove the absence of every secret or rights issue.",
};
const payload = {
  generated_at: new Date().toISOString(),
  scope: "all reachable git history and current tracked tree",
  limitations: [
    "Pattern scans are a safety control, not a proof that no secret or restricted data exists.",
    "No matching line contents, paths, or secret candidates are written to this report.",
    "A new sanitized repository must be reviewed independently before publication.",
  ],
  portfolio_publication_gate: portfolioPublicationGate,
  projects: audit,
};
mkdirSync("audits", { recursive: true });
writeFileSync(path.join("audits", "publication_history_scan.json"), JSON.stringify(payload, null, 2) + "\n");
writeFileSync(path.join("audits", "publication_history_scan.md"), "# Publication history scan\n\nPortfolio publication gate: **" + portfolioPublicationGate.status + "**.\n\n" + audit.map(item => `- ${item.project}: ${item.scan_status}; ${item.publication_decision}; current=${item.current_tree_match_counts.join(",")}; history=${item.history_commit_match_counts.join(",")}.`).join("\n") + "\n\nLaboratory scans are advisory for separate source-publication decisions; this gate applies only to the sanitized static portfolio.\n");
console.log(JSON.stringify({ portfolio_gate: portfolioPublicationGate.status, projects: audit.length, statuses: audit.map(x => x.scan_status) }));
if (!portfolioGatePassed) process.exitCode = 1;
