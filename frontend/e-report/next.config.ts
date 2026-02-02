import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // or '5mb', '20mb' – be realistic
    },
  },
};

export default nextConfig;
