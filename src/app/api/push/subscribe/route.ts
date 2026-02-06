import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// إعداد VAPID
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@remostore.com',
};

webpush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// الاشتراك في الإشعارات
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { subscription, action } = await req.json();

    if (action === 'subscribe') {
      // حفظ subscription في قاعدة البيانات
      await prisma.pushSubscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          subscription: JSON.stringify(subscription),
        },
        update: {
          subscription: JSON.stringify(subscription),
          updatedAt: new Date(),
        },
      });

      // إرسال إشعار تجريبي
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: '✅ تم التفعيل بنجاح',
            body: 'أنت الآن مشترك في الإشعارات',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          })
        );
      } catch (sendError) {
        console.error('Error sending test notification:', sendError);
      }

      return NextResponse.json({ 
        success: true,
        message: 'تم الاشتراك في الإشعارات بنجاح'
      });
    }

    if (action === 'unsubscribe') {
      await prisma.pushSubscription.delete({
        where: { userId: session.user.id },
      });

      return NextResponse.json({ 
        success: true,
        message: 'تم إلغاء الاشتراك بنجاح'
      });
    }

    return NextResponse.json({ error: 'إجراء غير صحيح' }, { status: 400 });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}

// إرسال إشعار لمستخدم محدد
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { userId, title, body, data } = await req.json();

    // جلب subscription المستخدم
    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json({ 
        error: 'المستخدم غير مشترك في الإشعارات' 
      }, { status: 404 });
    }

    const subscriptionObject = JSON.parse(subscription.subscription);

    // إرسال الإشعار
    await webpush.sendNotification(
      subscriptionObject,
      JSON.stringify({
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data,
      })
    );

    return NextResponse.json({ 
      success: true,
      message: 'تم إرسال الإشعار بنجاح'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الإشعار' },
      { status: 500 }
    );
  }
}
