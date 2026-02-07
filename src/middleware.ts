import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // التحقق من وجود session token cookie (خفيف بدون Prisma)
  const sessionToken = request.cookies.get('authjs.session-token') 
    || request.cookies.get('__Secure-authjs.session-token')
    || request.cookies.get('next-auth.session-token')
    || request.cookies.get('__Secure-next-auth.session-token');

  // إذا المستخدم مسجل دخول ويحاول فتح صفحة تسجيل الدخول
  if (sessionToken && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login'],
};