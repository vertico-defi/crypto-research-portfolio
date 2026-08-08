import { execFileSync } from "node:child_process";

// Pin the platform-specific immutable image used by GitHub's ubuntu runners.
export const texImage = "ghcr.io/xu-cheng/texlive-historic-alpine@sha256:82e4d4cc1366b1939932ad81853dc345097a028521cdf2618d2cb687eb0069f2";
export const requiredTexFiles = [
  "latex.ltx",
  "geometry.sty",
  "hyperref.sty",
  "fontenc.sty",
  "inputenc.sty",
];

const dockerArguments = ({ mounts = [], command }) => [
  "run",
  "--rm",
  "--network=none",
  "-e", "SOURCE_DATE_EPOCH=1577836800",
  "-e", "TZ=UTC",
  "-e", "LANG=C",
  "-e", "LC_ALL=C",
  ...mounts.flatMap(({ host, container = host }) => ["-v", `${host}:${container}`]),
  "-w", process.cwd(),
  texImage,
  ...command,
];

export const runTex = ({ mounts, command, stdio = "inherit" }) => execFileSync("docker", dockerArguments({ mounts, command }), { stdio });

export const checkLeadMagnetToolchain = () => {
  const version = execFileSync("docker", dockerArguments({ command: ["pdflatex", "--version"] }), { encoding: "utf8" })
    .split("\n")
    .slice(0, 2)
    .join("\n");
  const packages = execFileSync("docker", dockerArguments({ command: ["sh", "-c", `for file in ${requiredTexFiles.join(" ")}; do kpsewhich \"$file\" || exit 1; done`] }), { encoding: "utf8" })
    .trim()
    .split("\n");
  console.log(`TeX image: ${texImage}`);
  console.log(`TeX compiler:\n${version}`);
  console.log(`Required TeX files:\n${packages.join("\n")}`);
  return { version, packages };
};

if (process.argv[1]?.endsWith("lead-magnet-toolchain.mjs")) checkLeadMagnetToolchain();
