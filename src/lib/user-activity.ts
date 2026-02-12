// User Activity Tracking - مكتبة لتتبع نشاط المستخدمين
import { prisma } from './prisma';
import { UAParser } from 'ua-parser-js';

export interface ActivityLogData {
  userId: string;
  action: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}

/**
 * تسجيل نشاط المستخدم
 */
export async function logUserActivity(data: ActivityLogData) {
  try {
    const { userId, action, ip, userAgent, metadata } = data;

    // Parse user agent للحصول على معلومات الجهاز
    let deviceInfo: any = {};
    if (userAgent) {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();
      
      deviceInfo = {
        browser: result.browser.name || null,
        os: result.os.name || null,
        deviceType: result.device.type || 'DESKTOP',
        deviceModel: result.device.model || null,
      };
    }

    // حفظ السجل
    const log = await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        ip,
        userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType?.toUpperCase(),
        deviceModel: deviceInfo.deviceModel,
        metadata: metadata || {},
      },
    });

    // تحديث آخر تسجيل دخول (إذا كان login)
    if (action === 'LOGIN') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          lastLoginDevice: deviceInfo.deviceModel || deviceInfo.os || 'Unknown',
        },
      });
    }

    return log;
  } catch (error) {
    console.error('❌ خطأ في تسجيل النشاط:', error);
    // لا نرمي error عشان ما نكسرش التطبيق
    return null;
  }
}

/**
 * الحصول على آخر أنشطة المستخدم
 */
export async function getUserActivities(userId: string, limit: number = 20) {
  return await prisma.userActivityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * الحصول على آخر تسجيل دخول
 */
export async function getLastLogin(userId: string) {
  return await prisma.userActivityLog.findFirst({
    where: {
      userId,
      action: 'LOGIN',
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * إحصائيات نشاط المستخدم
 */
export async function getUserActivityStats(userId: string) {
  const logs = await prisma.userActivityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    totalActivities: logs.length,
    lastActivity: logs[0] || null,
    deviceTypes: {} as Record<string, number>,
    browsers: {} as Record<string, number>,
    actions: {} as Record<string, number>,
  };

  logs.forEach(log => {
    // تجميع حسب نوع الجهاز
    if (log.deviceType) {
      stats.deviceTypes[log.deviceType] = (stats.deviceTypes[log.deviceType] || 0) + 1;
    }
    
    // تجميع حسب المتصفح
    if (log.browser) {
      stats.browsers[log.browser] = (stats.browsers[log.browser] || 0) + 1;
    }
    
    // تجميع حسب النشاط
    stats.actions[log.action] = (stats.actions[log.action] || 0) + 1;
  });

  return stats;
}

/**
 * مسح السجلات القديمة (أكثر من 90 يوم)
 */
export async function cleanOldActivityLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deleted = await prisma.userActivityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return deleted.count;
}
