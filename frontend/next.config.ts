import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_SHOW_GITHUB_BUTTON: process.env.NEXT_PUBLIC_SHOW_GITHUB_BUTTON || 'false',
  },
};

export default nextConfig;
