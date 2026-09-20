import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photography is served from public/media, so no remote image hosts are needed.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Keeps the dev overlay out of screenshots taken by scripts/shot.mjs.
  devIndicators: false,
};

export default nextConfig;
