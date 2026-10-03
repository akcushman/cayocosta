import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // scripts/photos.mjs already makes web-sized copies, and Vercel's
    // on-the-fly resizer stalled for 5–9s when a channel asked for a dozen
    // images at once. Serve the files straight from the CDN instead.
    unoptimized: true,
  },
};

export default nextConfig;
