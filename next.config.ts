import type { NextConfig } from "next";

// Static export for GitHub Pages: no server features, every route is prerendered.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
