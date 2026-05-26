import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
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
  // experimental: {
  //   serverActions: {
  //     allowedOrigins: ["m0c7hdhv-3000.eun1.devtunnels.ms", "localhost:3000"],
  //   },
  // },
};

export default nextConfig;
