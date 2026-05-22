import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: 'https',
        hostname: 'swjqqxhvicbxqcembkml.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // Skip type checking during dev (do it in CI or on demand)
    ignoreBuildErrors: true,
  },
  // Reduce webpack workers
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: false,
      ignored: /node_modules/,
    };
    return config;
  },
};

export default nextConfig;
