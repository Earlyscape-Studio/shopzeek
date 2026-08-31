import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.IS_HOSTINGER === 'true' ? 'standalone' : undefined,
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "swjqqxhvicbxqcembkml.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["zeek.you", "localhost:3000"],
    },
  },
};

export default nextConfig;
