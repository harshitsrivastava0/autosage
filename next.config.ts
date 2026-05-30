import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sql.js loads a WASM binary at runtime — exclude from webpack bundling
  serverExternalPackages: ["sql.js"],
};

export default nextConfig;
