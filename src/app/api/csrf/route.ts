/**
 * 🛡️ CSRF Token API
 * 
 * يوفر CSRF token للـ frontend للاستخدام في الطلبات الحساسة
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/security/csrf';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf
 * الحصول على CSRF token جديد
 */
export async function GET(request: NextRequest) {
  try {
    // الحصول على session إن وجدت
    const session = await auth();
    
    // إنشاء token (مع أو بدون userId)
    const csrfToken = generateCSRFToken(session?.user?.id);
    
    return NextResponse.json({
      csrfToken,
      expiresIn: '24 hours',
      usage: 'Include this token in X-CSRF-Token header for POST/PUT/DELETE requests'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error('❌ Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء CSRF token' },
      { status: 500 }
    );
  }
}
