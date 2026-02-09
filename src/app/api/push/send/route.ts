import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import webpush from "web-push";

// إعداد web-push مع VAPID keys
// يمكنك توليد VAPID keys باستخدام: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@brandstore.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// إرسال إشعارات push
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "VAPID keys غير مُعدّة. الرجاء إضافتها في ملف .env" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, body: notificationBody, icon, image, url, tag, requireInteraction } = body;

    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: "العنوان والمحتوى مطلوبان" },
        { status: 400 }
      );
    }

    // جلب جميع الاشتراكات
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "لا يوجد مشتركين لإرسال الإشعارات لهم" },
        { status: 400 }
      );
    }

    // إعداد بيانات الإشعار
    const notificationPayload = JSON.stringify({
      title,
      body: notificationBody,
      icon: icon || "/logo.png",
      image: image || undefined,
      badge: "/logo.png",
      url: url || "/",
      tag: tag || `notification-${Date.now()}`,
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: Date.now().toString(),
      },
    });

    // إرسال الإشعارات لكل المشتركين
    let successCount = 0;
    let failedCount = 0;
    const failedEndpoints: Array<{ endpoint: string; reason: string; statusCode?: number }> = [];

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          notificationPayload
        );
        successCount++;
        console.log(`✅ [Push] نجح الإرسال لـ: ${subscription.endpoint.substring(0, 50)}...`);
      } catch (error: any) {
        const statusCode = error.statusCode || error.status;
        const errorMsg = error.message || 'Unknown error';
        
        console.error(`❌ [Push] فشل الإرسال - Status: ${statusCode}, Endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        console.error(`   السبب: ${errorMsg}`);
        
        failedCount++;
        failedEndpoints.push({
          endpoint: subscription.endpoint.substring(0, 50),
          reason: errorMsg,
          statusCode
        });

        // إذا كان الاشتراك غير صالح (410 Gone أو 404)، احذفه من قاعدة البيانات
        if (statusCode === 410 || statusCode === 404) {
          console.log(`🗑️ [Push] حذف اشتراك منتهي الصلاحية: ${subscription.endpoint.substring(0, 50)}...`);
          await prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint },
          }).catch(() => {});
        }
      }
    });

    await Promise.all(sendPromises);

    // طباعة ملخص
    console.log('📊 [Push] ملخص الإرسال:');
    console.log(`   ✅ نجح: ${successCount}`);
    console.log(`   ❌ فشل: ${failedCount}`);
    if (failedEndpoints.length > 0) {
      console.log('   أسباب الفشل:');
      failedEndpoints.forEach((f, i) => {
        console.log(`     ${i + 1}. Status ${f.statusCode}: ${f.reason}`);
      });
    }

    // حفظ سجل الإشعار في قاعدة البيانات
    await prisma.pushNotification.create({
      data: {
        title,
        body: notificationBody,
        icon: icon || "/logo.png",
        image: image || undefined,
        url: url || undefined,
        tag: tag || undefined,
        requireInteraction: requireInteraction || false,
        sentBy: session.user.id,
        sentToAll: true,
        recipientCount: subscriptions.length,
        successCount,
        failedCount,
      },
    });

    return NextResponse.json({
      message: "تم إرسال الإشعارات بنجاح",
      recipientCount: subscriptions.length,
      successCount,
      failedCount,
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الإشعارات" },
      { status: 500 }
    );
  }
}
