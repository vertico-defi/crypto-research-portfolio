import type { NextConfig } from "next";
const staticPublic = process.env.PUBLIC_STATIC_DEPLOY === "true";
const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  output: staticPublic ? "export" : undefined,
  basePath: staticPublic ? "/crypto-research-portfolio" : undefined,
  assetPrefix: staticPublic ? "/crypto-research-portfolio/" : undefined,
};
export default nextConfig;
