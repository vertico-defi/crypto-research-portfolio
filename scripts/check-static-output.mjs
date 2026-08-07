import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const base = "/crypto-research-portfolio";
const required = ["research", "insights", "resources", "newsletter", "products", "about", "legal"];
const visit = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? visit(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
export const checkStaticOutput = (root = process.cwd()) => {
  const out = path.join(root, "out");
  if (!existsSync(out)) throw new Error("Build output does not exist; run npm run build first.");
  for (const route of required) if (!existsSync(path.join(out, route, "index.html"))) throw new Error(`Missing static route: /${route}`);
  const files = visit(out);
  if (files.some(file => /\/api\//.test(file))) throw new Error("Static output contains an API route.");
  for (const file of files.filter(file => file.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    if (!html.includes('<html lang="en">')) throw new Error(`Missing document language: ${file}`);
    for (const image of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]*"/.test(image[0])) throw new Error(`Image without alt text: ${file}`);
    for (const input of html.matchAll(/<input\b[^>]*\bid="([^"]+)"[^>]*>/g)) if (!html.includes(`<label for="${input[1]}">`)) throw new Error(`Input without label: ${file}`);
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      const target = match[1];
      if (/^(https?:|mailto:)/.test(target)) continue;
      if (!target.startsWith(`${base}/`)) throw new Error(`Local link is outside the GitHub Pages base path in ${file}: ${target}`);
      const deployedPath = target.slice(base.length);
      if (deployedPath === "/") continue;
      const candidate = path.join(out, deployedPath.slice(1));
      if (!existsSync(candidate) && !existsSync(`${candidate}.html`) && !existsSync(path.join(candidate, "index.html"))) throw new Error(`Broken local link in ${file}: ${target}`);
    }
  }
  return { static_routes: required.length, api_routes: 0, broken_local_links: 0, basic_accessibility_checks: "pass" };
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(checkStaticOutput()));
