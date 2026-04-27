import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-5fff3d97-2858-4e1b-b7b3-68f281b41bdb.space.z.ai",
    "*.space.z.ai",
  ],
};

export default nextConfig;
