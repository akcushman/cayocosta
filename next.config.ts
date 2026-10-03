import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Playlist cover art for CH 06 · On Air.
    remotePatterns: [
      { protocol: "https", hostname: "**.spotifycdn.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
};

export default nextConfig;
