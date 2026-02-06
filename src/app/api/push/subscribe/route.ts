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
      // التحقق من صحة بيانات الاشتراك
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return NextResponse.json({ 
          error: 'بيانات الاشتراك غير صحيحة' 
        }, { status: 400 });
      }

      const userAgent = req.headers.get('user-agent') || undefined;

      // حفظ subscription في قاعدة البيانات مع الـ schema الجديد
      await prisma.pushSubscription.upsert({
        where: { endpoint: subscription.endpoint },
        create: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
          isActive: true,
        },
        update: {
          userId: session.user.id,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
          isActive: true,
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
      const { endpoint } = await req.json();
      
      if (!endpoint) {
        return NextResponse.json({ 
          error: 'يجب توفير endpoint' 
        }, { status: 400 });
      }

      // إلغاء تفعيل الاشتراك بدلاً من حذفه
      await prisma.pushSubscription.updateMany({
        where: { 
          endpoint,
          userId: session.user.id 
        },
        data: { isActive: false },
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

    // جلب جميع subscriptions النشطة للمستخدم
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { 
        userId,
        isActive: true 
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        error: 'المستخدم غير مشترك في الإشعارات' 
      }, { status: 404 });
    }

    // إرسال الإشعار لجميع الأجهزة
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const subscriptionObject = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
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
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // إذا كان الاشتراك منتهي أو invalid، قم بإلغاء تفعيله
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          }
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ 
      success: true,
      message: `تم إرسال الإشعار بنجاح إلى ${successful} جهاز`,
      stats: { successful, failed, total: subscriptions.length }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الإشعار' },
      { status: 500 }
    );
  }
}
