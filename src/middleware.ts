import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // التحقق من وجود token (أخف من استخدام auth())
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // إذا المستخدم مسجل دخول ويحاول فتح صفحة تسجيل الدخول أو التسجيل
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    // توجيه بناءً على role
    const role = token.role as string;
    
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'VENDOR') {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    } else if (role === 'MANUFACTURER') {
      return NextResponse.redirect(new URL('/manufacturer/dashboard', request.url));
    } else if (role === 'DELIVERY_STAFF') {
      return NextResponse.redirect(new URL('/delivery-dashboard', request.url));
    } else if (role === 'MARKETING_STAFF') {
      return NextResponse.redirect(new URL('/marketing/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login', '/auth/register'],
};