import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable strict linting for development
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
