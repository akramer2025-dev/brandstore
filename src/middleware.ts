import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // السماح للعمليات التالية دون فحص
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const session = await auth();

    // إذا المستخدم مسجل دخول ويحاول فتح صفحة تسجيل الدخول
    if (session?.user && pathname === '/auth/login') {
      console.log('🔄 Redirecting logged-in user from login page to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // تشغيل middleware على جميع المسارات ما عدا API routes والملفات الثابتة
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};