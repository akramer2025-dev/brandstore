import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // التحقق من وجود session
  const session = await auth();

  // إذا المستخدم مسجل دخول ويحاول فتح صفحة تسجيل الدخول أو التسجيل
  if (session?.user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    // توجيه بناءً على role
    if (session.user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (session.user.role === 'VENDOR') {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    } else if (session.user.role === 'MANUFACTURER') {
      return NextResponse.redirect(new URL('/manufacturer/dashboard', request.url));
    } else if (session.user.role === 'DELIVERY_STAFF') {
      return NextResponse.redirect(new URL('/delivery-dashboard', request.url));
    } else if (session.user.role === 'MARKETING_STAFF') {
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