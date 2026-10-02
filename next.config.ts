import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Both loopback addresses are used by the local admin previews.
  allowedDevOrigins: ["127.0.0.1"],
  // Photography is served from public/media, so no remote image hosts are needed.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Keeps the dev overlay out of screenshots taken by scripts/shot.mjs.
  devIndicators: false,
};

export default nextConfig;
