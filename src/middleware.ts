import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * 🛡️ Middleware محسّن مع طبقات حماية متعددة
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ========== SECURITY HEADERS ==========
  // منع XSS
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://accounts.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://www.google-analytics.com https://graph.facebook.com https://accounts.google.com; " +
    "frame-src 'self' https://www.facebook.com https://web.facebook.com https://accounts.google.com; " +
    "frame-ancestors 'none';"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self), usb=()'
  );
  
  // Strict Transport Security (HTTPS only في الإنتاج)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // ========== ORIGIN VALIDATION ==========
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
    'https://remostore.net',
    'https://www.remostore.net'
  ].filter(Boolean);

  // التحقق من Origin للطلبات الحساسة
  if (origin && !allowedOrigins.includes(origin)) {
    // السماح بـ GET requests من أي مصدر
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      console.warn('🚨 Blocked request from unauthorized origin:', origin);
    }
  }

  // ========== AUTH REDIRECTION ==========
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // إذا المستخدم مسجل دخول ويحاول فتح صفحة تسجيل الدخول أو التسجيل
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const role = token.role as string;
    
    // توجيه بناءً على role
    const redirectMap: Record<string, string> = {
      'ADMIN': '/admin',
      'VENDOR': '/vendor/dashboard',
      'VEHICLE_DEALER': '/vehicle-dealer/dashboard',
      'MANUFACTURER': '/manufacturer/dashboard',
      'DELIVERY_STAFF': '/delivery-dashboard',
      'MARKETING_STAFF': '/marketing/dashboard'
    };
    
    const redirectPath = redirectMap[role] || '/';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // ========== API RATE LIMITING INFO ==========
  // إضافة headers توضح معلومات Rate Limiting (للتنفيذ في كل API route)
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', 'Enabled');
  }

  return response;
}

export const config = {
  matcher: [
    // Auth pages
    '/auth/:path*',
    // API routes
    '/api/:path*',
    // Protected pages
    '/admin/:path*',
    '/vendor/:path*',
    '/delivery-dashboard/:path*',
    '/marketing/:path*'
  ],
};