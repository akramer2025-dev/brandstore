import webpush from 'web-push';
import { prisma } from './prisma';

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

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * إرسال push notification لمستخدم معين
 * @param userId - معرف المستخدم
 * @param payload - محتوى الإشعار
 * @returns عدد الأجهزة التي تم إرسال الإشعار إليها بنجاح
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ successful: number; failed: number }> {
  try {
    // جلب جميع subscriptions النشطة للمستخدم
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      console.log(`⚠️  No active push subscriptions for user ${userId}`);
      return { successful: 0, failed: 0 };
    }

    // إعداد المحتوى
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      data: payload.data || {},
      actions: payload.actions || [],
    });

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
          await webpush.sendNotification(subscriptionObject, notificationPayload);
          console.log(`✅ Push sent to device: ${sub.endpoint.slice(0, 50)}...`);
          return true;
        } catch (error: any) {
          console.error(`❌ Failed to send push to device:`, error.message);

          // إذا كان الاشتراك منتهي الصلاحية، قم بإلغاء تفعيله
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
            console.log(`🗑️  Deactivated expired subscription: ${sub.id}`);
          }

          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`📊 Push notification stats - Successful: ${successful}, Failed: ${failed}`);

    return { successful, failed };
  } catch (error) {
    console.error('❌ Error in sendPushToUser:', error);
    return { successful: 0, failed: 0 };
  }
}

/**
 * إرسال push notification لتاجر معين عن طريق vendorId
 * @param vendorId - معرف التاجر
 * @param payload - محتوى الإشعار
 */
export async function sendPushToVendor(
  vendorId: string,
  payload: PushNotificationPayload
): Promise<{ successful: number; failed: number }> {
  try {
    // جلب userId الخاص بالتاجر
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { userId: true },
    });

    if (!vendor) {
      console.error(`❌ Vendor not found: ${vendorId}`);
      return { successful: 0, failed: 0 };
    }

    return await sendPushToUser(vendor.userId, payload);
  } catch (error) {
    console.error('❌ Error in sendPushToVendor:', error);
    return { successful: 0, failed: 0 };
  }
}

/**
 * إرسال push notification لعميل معين عن طريق customerId
 * @param customerId - معرف العميل
 * @param payload - محتوى الإشعار
 */
export async function sendPushToCustomer(
  customerId: string,
  payload: PushNotificationPayload
): Promise<{ successful: number; failed: number }> {
  try {
    // جلب userId الخاص بالعميل
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { userId: true },
    });

    if (!customer) {
      console.error(`❌ Customer not found: ${customerId}`);
      return { successful: 0, failed: 0 };
    }

    return await sendPushToUser(customer.userId, payload);
  } catch (error) {
    console.error('❌ Error in sendPushToCustomer:', error);
    return { successful: 0, failed: 0 };
  }
}

/**
 * إرسال push notification لجميع التجار
 * @param payload - محتوى الإشعار
 */
export async function sendPushToAllVendors(
  payload: PushNotificationPayload
): Promise<{ successful: number; failed: number; total: number }> {
  try {
    const vendors = await prisma.vendor.findMany({
      select: { userId: true },
    });

    let totalSuccessful = 0;
    let totalFailed = 0;

    for (const vendor of vendors) {
      const result = await sendPushToUser(vendor.userId, payload);
      totalSuccessful += result.successful;
      totalFailed += result.failed;
    }

    console.log(`📊 Broadcast to all vendors - Successful: ${totalSuccessful}, Failed: ${totalFailed}`);

    return {
      successful: totalSuccessful,
      failed: totalFailed,
      total: vendors.length,
    };
  } catch (error) {
    console.error('❌ Error in sendPushToAllVendors:', error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

export { webpush };
