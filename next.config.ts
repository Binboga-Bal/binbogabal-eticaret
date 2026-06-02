import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Client-side Router Cache: ziyaret edilen sayfaları tutarak geri/ileri ve
    // tekrar gezinmeyi anlık yap. dynamic:0 (eski değer) her geçişte sunucuya
    // gidip DB sorgusu yapılmasına neden oluyordu.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
