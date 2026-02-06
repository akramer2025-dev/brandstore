import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendPushToUser } from '@/lib/push-service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { userId } = await req.json();
    const targetUserId = userId || session.user.id;

    console.log(`🧪 [Test Push] إرسال push تجريبي للمستخدم: ${targetUserId}`);

    // إرسال Push Notification
    const result = await sendPushToUser(targetUserId, {
      title: '🧪 اختبار Push Notification',
      body: 'هذا إشعار تجريبي - تم الإرسال بنجاح! 🎉',
      data: {
        type: 'TEST',
        timestamp: new Date().toISOString(),
      },
      actions: [
        {
          action: 'ok',
          title: 'حسناً',
        },
      ],
    });

    console.log(`✅ [Test Push] نتيجة الإرسال:`, result);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الإشعار التجريبي',
      result,
    });
  } catch (error: any) {
    console.error('❌ [Test Push] خطأ:', error);
    return NextResponse.json(
      { error: 'فشل إرسال الإشعار التجريبي', details: error.message },
      { status: 500 }
    );
  }
}
