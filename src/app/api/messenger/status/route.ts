import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messenger/status
 * فحص حالة البوت: هل مُعدّ أم لا
 */
export async function GET(request: NextRequest) {
  try {
    // فحص وجود المتغيرات المطلوبة
    const verifyToken = process.env.MESSENGER_VERIFY_TOKEN;
    const pageAccessToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN;

    const configured = !!(verifyToken && pageAccessToken);

    return NextResponse.json({
      configured,
      hasVerifyToken: !!verifyToken,
      hasPageAccessToken: !!pageAccessToken,
      status: configured ? 'ready' : 'not_configured',
      message: configured 
        ? 'البوت جاهز ومُعدّ بشكل صحيح'
        : 'يجب إضافة متغيرات البيئة المطلوبة'
    });
  } catch (error) {
    console.error('❌ خطأ في فحص حالة البوت:', error);
    return NextResponse.json(
      {
        configured: false,
        error: 'حدث خطأ أثناء فحص الحالة'
      },
      { status: 500 }
    );
  }
}
