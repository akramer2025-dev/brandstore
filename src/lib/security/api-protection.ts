/**
 * 🛡️ حماية API Routes
 * 
 * وظائف مساعدة لتأمين الـ API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * التحقق من الصلاحيات
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    };
  }
  
  return {
    authorized: true,
    user: session.user
  };
}

/**
 * التحقق من دور المستخدم
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
) {
  const authCheck = await requireAuth(request);
  
  if (!authCheck.authorized) {
    return authCheck;
  }
  
  const userRole = authCheck.user?.role;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'ليس لديك صلاحية للقيام بهذا الإجراء' },
        { status: 403 }
      )
    };
  }
  
  return {
    authorized: true,
    user: authCheck.user,
    role: userRole
  };
}

/**
 * التحقق من Admin
 */
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['ADMIN']);
}

/**
 * التحقق من Vendor
 */
export async function requireVendor(request: NextRequest) {
  return requireRole(request, ['VENDOR', 'ADMIN']);
}

/**
 * معالج آمن للأخطاء
 */
export function handleError(error: any): NextResponse {
  console.error('❌ API Error:', error);
  
  // في التطوير، إرجاع تفاصيل الخطأ
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        error: error.message || 'حدث خطأ ما',
        details: error.stack
      },
      { status: 500 }
    );
  }
  
  // في الإنتاج، رسالة عامة فقط
  return NextResponse.json(
    { error: 'حدث خطأ في الخادم. حاول مرة أخرى لاحقاً' },
    { status: 500 }
  );
}

/**
 * التحقق من Content-Type
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[]
): boolean {
  const contentType = request.headers.get('content-type') || '';
  
  return allowedTypes.some(type => contentType.includes(type));
}

/**
 * التحقق من Origin للحماية من CORS attacks
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
    'https://remostore.net',
    'https://www.remostore.net'
  ].filter(Boolean);
  
  // إذا لم يكن هناك origin (same-origin request)
  if (!origin) return true;
  
  return allowedOrigins.includes(origin);
}

/**
 * معالج API آمن شامل
 */
export function createSecureHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
  options?: {
    requireAuth?: boolean;
    allowedRoles?: string[];
    allowedMethods?: string[];
    requireCSRF?: boolean;
  }
) {
  return async (
    request: NextRequest,
    context?: any
  ): Promise<NextResponse<T>> => {
    try {
      // التحقق من HTTP Method
      if (options?.allowedMethods) {
        if (!options.allowedMethods.includes(request.method)) {
          return NextResponse.json(
            { error: 'طريقة غير مسموحة' } as any,
            { status: 405 }
          );
        }
      }
      
      // التحقق من Origin
      if (!validateOrigin(request)) {
        console.warn('🚨 Invalid origin:', request.headers.get('origin'));
        return NextResponse.json(
          { error: 'طلب غير مسموح' } as any,
          { status: 403 }
        );
      }
      
      // التحقق من Authentication
      if (options?.requireAuth) {
        const authCheck = await requireAuth(request);
        if (!authCheck.authorized) {
          return authCheck.response as NextResponse<T>;
        }
      }
      
      // التحقق من الصلاحيات
      if (options?.allowedRoles) {
        const roleCheck = await requireRole(request, options.allowedRoles);
        if (!roleCheck.authorized) {
          return roleCheck.response as NextResponse<T>;
        }
      }
      
      // تنفيذ المعالج
      return await handler(request, context);
    } catch (error) {
      return handleError(error) as NextResponse<T>;
    }
  };
}

/**
 * إضافة Security Headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // منع XSS
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://graph.facebook.com; frame-src 'self' https://www.facebook.com https://web.facebook.com;"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );
  
  return response;
}

/**
 * معالج API مع Security Headers
 */
export function secureResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}
