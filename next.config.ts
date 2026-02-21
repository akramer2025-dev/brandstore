import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ⚡ Performance Optimizations
  optimizeFonts: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      ...(process.env.NODE_ENV === 'development' ? [
        {
          protocol: 'http' as const,
          hostname: 'localhost',
        },
      ] : []),
    ],
  },
  
  // 🛡️ Merged Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Cache Control
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Clickjacking Protection
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self), usb=()'
          },
          // HSTS - Force HTTPS (1 year)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://ipapi.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https:",
              "connect-src 'self' https://www.google-analytics.com https://ipapi.co https://*.vercel.app wss://*.vercel.app https://api.cloudinary.com",
              "frame-src 'self' https://www.facebook.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; ')
          },
        ],
      },
    ];
  },
  
  // منع الوصول لملفات حساسة
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;

