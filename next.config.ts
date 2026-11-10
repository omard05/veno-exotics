import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev database) ships WASM and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  images: {
    // Allow vehicle photos hosted anywhere over HTTPS (CDN, Instagram exports, etc.).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
