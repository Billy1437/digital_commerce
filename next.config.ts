import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Listing screenshots are served from S3 via our own /api/screenshots
      // proxy route (local path), so no remote host is needed for them.
    ],
  },
};

export default nextConfig;
