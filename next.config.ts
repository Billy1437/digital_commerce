import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Listing screenshots are served from S3 via our own /api/screenshots
      // proxy route (local path), so no remote host is needed for them.
      // Payment slips still live in Supabase Storage; the admin queue views
      // them through signed URLs from this host.
      {
        protocol: "https",
        hostname: "yjcbuorktvrbwvlpiinz.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },
};

export default nextConfig;
