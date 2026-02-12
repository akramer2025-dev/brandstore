// 📱 أمثلة عملية لاستخدام نظام الإشعارات في Remostore

import { messaging } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

/**
 * مثال 1: إرسال إشعار لمستخدم واحد عند تأكيد طلبه
 */
export async function notifyOrderConfirmed(orderId: string, userId: string) {
  try {
    // جلب token المستخدم
    const userTokens = await prisma.fCMDeviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true }
    });

    if (userTokens.length === 0) {
      console.log('❌ لا يوجد tokens للمستخدم');
      return;
    }

    // إرسال الإشعار
    const response = await messaging.sendEachForMulticast({
      notification: {
        title: 'تم تأكيد طلبك! ✅',
        body: `طلب رقم #${orderId} تم تأكيده وجاري التحضير`,
      },
      data: {
        type: 'order',
        orderId: orderId,
        action: 'view_order',
        status: 'confirmed'
      },
      tokens: userTokens.map(t => t.token)
    });

    console.log(`✅ تم إرسال إشعار التأكيد: ${response.successCount} نجح`);
    
    return response;
  } catch (error) {
    console.error('❌ خطأ في إرسال إشعار الطلب:', error);
    throw error;
  }
}

/**
 * مثال 2: إشعار بداية الشحن
 */
export async function notifyOrderShipped(orderId: string, userId: string, trackingNumber: string) {
  const userTokens = await prisma.fCMDeviceToken.findMany({
    where: { userId, isActive: true },
    select: { token: true }
  });

  if (userTokens.length > 0) {
    await messaging.sendEachForMulticast({
      notification: {
        title: 'طلبك في الطريق! 🚚',
        body: `رقم التتبع: ${trackingNumber}`,
      },
      data: {
        type: 'shipping',
        orderId: orderId,
        trackingNumber: trackingNumber,
        action: 'track_order'
      },
      tokens: userTokens.map(t => t.token)
    });
  }
}

/**
 * مثال 3: إشعار وصول الطلب
 */
export async function notifyOrderDelivered(orderId: string, userId: string) {
  const userTokens = await prisma.fCMDeviceToken.findMany({
    where: { userId, isActive: true },
    select: { token: true }
  });

  if (userTokens.length > 0) {
    await messaging.sendEachForMulticast({
      notification: {
        title: 'تم التوصيل بنجاح! 🎉',
        body: 'نتمنى أن تكون راضياً عن منتجاتك. يمكنك تقييمها الآن!',
      },
      data: {
        type: 'delivery',
        orderId: orderId,
        action: 'rate_order'
      },
      tokens: userTokens.map(t => t.token)
    });
  }
}

/**
 * مثال 4: إشعار عرض خاص لجميع المستخدمين
 */
export async function notifySpecialOffer(
  title: string, 
  body: string, 
  couponCode?: string,
  imageUrl?: string
) {
  try {
    // جلب كل الأجهزة النشطة
    const allTokens = await prisma.fCMDeviceToken.findMany({
      where: { isActive: true },
      select: { token: true }
    });

    if (allTokens.length === 0) {
      console.log('❌ لا يوجد أجهزة مسجلة');
      return;
    }

    // FCM يدعم حد أقصى 500 token في المرة
    // نقسمهم لـ batches
    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < allTokens.length; i += batchSize) {
      const batch = allTokens.slice(i, i + batchSize);
      
      const response = await messaging.sendEachForMulticast({
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl })
        },
        data: {
          type: 'promotion',
          ...(couponCode && { couponCode })
        },
        tokens: batch.map(t => t.token)
      });

      successCount += response.successCount;
      failureCount += response.failureCount;
    }

    // حفظ في السجل
    await prisma.pushNotification.create({
      data: {
        title,
        body,
        image: imageUrl,
        data: couponCode ? { couponCode } : {},
        sentBy: 'SYSTEM',
        sentToAll: true,
        recipientCount: allTokens.length,
        successCount,
        failedCount: failureCount
      }
    });

    console.log(`✅ إرسال لـ ${allTokens.length} جهاز: ${successCount} نجح, ${failureCount} فشل`);
    
    return { successCount, failureCount };
  } catch (error) {
    console.error('❌ خطأ في إرسال عرض خاص:', error);
    throw error;
  }
}

/**
 * مثال 5: إشعار رسالة جديدة من خدمة العملاء
 */
export async function notifyNewMessage(userId: string, messagePreview: string) {
  const userTokens = await prisma.fCMDeviceToken.findMany({
    where: { userId, isActive: true },
    select: { token: true }
  });

  if (userTokens.length > 0) {
    await messaging.sendEachForMulticast({
      notification: {
        title: 'رسالة جديدة 💬',
        body: messagePreview.substring(0, 100),
      },
      data: {
        type: 'message',
        action: 'open_chat'
      },
      tokens: userTokens.map(t => t.token),
      android: {
        priority: 'high', // أولوية عالية للرسائل
        notification: {
          sound: 'default',
          channelId: 'messages'
        }
      }
    });
  }
}

/**
 * مثال 6: إشعار منتج عاد للمخزون
 */
export async function notifyProductBackInStock(productId: string, productName: string) {
  // جلب المستخدمين اللي عندهم المنتج في wishlist
  const interestedUsers = await prisma.wishlistItem.findMany({
    where: { productId },
    select: { userId: true }
  });

  if (interestedUsers.length === 0) return;

  const userIds = interestedUsers.map(u => u.userId);
  
  const tokens = await prisma.fCMDeviceToken.findMany({
    where: { 
      userId: { in: userIds },
      isActive: true 
    },
    select: { token: true }
  });

  if (tokens.length > 0) {
    await messaging.sendEachForMulticast({
      notification: {
        title: 'المنتج متوفر الآن! 🎯',
        body: `${productName} عاد للمخزون - اطلبه الآن قبل نفاذه!`,
      },
      data: {
        type: 'product',
        productId: productId,
        action: 'view_product'
      },
      tokens: tokens.map(t => t.token)
    });
  }
}

/**
 * مثال 7: تنظيف الـ tokens غير النشطة
 */
export async function cleanupInactiveTokens() {
  try {
    // حذف tokens غير مستخدمة منذ أكثر من 90 يوم
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.fCMDeviceToken.deleteMany({
      where: {
        lastUsedAt: {
          lt: ninetyDaysAgo
        }
      }
    });

    console.log(`🗑️ تم حذف ${result.count} token غير نشط`);
    return result.count;
  } catch (error) {
    console.error('❌ خطأ في تنظيف tokens:', error);
    throw error;
  }
}

/**
 * مثال 8: إحصائيات الإشعارات
 */
export async function getNotificationStats() {
  const stats = await prisma.$transaction([
    // عدد الأجهزة النشطة
    prisma.fCMDeviceToken.count({
      where: { isActive: true }
    }),
    
    // عدد الأجهزة حسب Platform
    prisma.fCMDeviceToken.groupBy({
      by: ['platform'],
      where: { isActive: true },
      _count: true
    }),
    
    // عدد الإشعارات المرسلة اليوم
    prisma.pushNotification.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    
    // معدل النجاح
    prisma.pushNotification.aggregate({
      _sum: {
        successCount: true,
        failedCount: true,
        recipientCount: true
      }
    })
  ]);

  return {
    activeDevices: stats[0],
    devicesByPlatform: stats[1],
    notificationsSentToday: stats[2],
    overallStats: stats[3]
  };
}

/**
 * مثال 9: إرسال إشعار مجدول (مع Cron Job مثلاً)
 */
export async function sendScheduledReminders() {
  // مثال: تذكير بالعربة المهجورة
  const abandonedCarts = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      createdAt: {
        // الطلبات القديمة 24 ساعة
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lte: new Date(Date.now() - 23 * 60 * 60 * 1000)
      }
    },
    select: {
      id: true,
      userId: true,
      totalPrice: true
    }
  });

  for (const cart of abandonedCarts) {
    const tokens = await prisma.fCMDeviceToken.findMany({
      where: { userId: cart.userId, isActive: true },
      select: { token: true }
    });

    if (tokens.length > 0) {
      await messaging.sendEachForMulticast({
        notification: {
          title: 'لا تنسى طلبك! 🛒',
          body: `لديك طلب بقيمة ${cart.totalPrice} جنيه في العربة - أكمله الآن!`,
        },
        data: {
          type: 'cart',
          orderId: cart.id,
          action: 'complete_order'
        },
        tokens: tokens.map(t => t.token)
      });
    }
  }
}

/**
 * مثال 10: إشعار نقاط الولاء
 */
export async function notifyPointsEarned(userId: string, points: number, reason: string) {
  const tokens = await prisma.fCMDeviceToken.findMany({
    where: { userId, isActive: true },
    select: { token: true }
  });

  if (tokens.length > 0) {
    await messaging.sendEachForMulticast({
      notification: {
        title: `حصلت على ${points} نقطة! ⭐`,
        body: reason,
      },
      data: {
        type: 'points',
        points: points.toString(),
        action: 'view_points'
      },
      tokens: tokens.map(t => t.token)
    });
  }
}

// تصدير الدوال
export default {
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifySpecialOffer,
  notifyNewMessage,
  notifyProductBackInStock,
  cleanupInactiveTokens,
  getNotificationStats,
  sendScheduledReminders,
  notifyPointsEarned
};
