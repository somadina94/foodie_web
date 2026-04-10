import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.backblazeb2.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unpkg.com",
        pathname: "/leaflet@*/dist/images/**",
      },
    ],
  },
};

export default nextConfig;
