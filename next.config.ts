import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase storage (listing screenshots) — wired up when admin uploads land
      { protocol: "https", hostname: "ncfylrblnoctlwemhmex.supabase.co" },
    ],
  },
};

export default nextConfig;
