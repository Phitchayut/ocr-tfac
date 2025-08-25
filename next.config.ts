import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, 
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
