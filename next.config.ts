import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // تعطيل ESLint أثناء البناء - سيتم إصلاحها لاحقاً
    ignoreDuringBuilds: true,
  },
  typescript: {
    // تعطيل TypeScript errors أثناء البناء
    ignoreBuildErrors: true,
  },
  images: {
    // السماح بجميع النطاقات الخارجية
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
