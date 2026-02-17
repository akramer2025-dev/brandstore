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

    // 🌍 الحصول على الموقع الجغرافي من IP
    let location: string | null = null;
    if (ip && ip !== '::1' && ip !== '127.0.0.1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
          next: { revalidate: 3600 } // كاش لمدة ساعة
        });
        
        if (response.ok) {
          const data = await response.json();
          location = `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
        }
      } catch (error) {
        console.log('⚠️ Could not fetch location for IP:', ip);
      }
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
        location,
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

/**
 * 🕵️ إحصائيات متقدمة لنشاط الشركاء (للأدمن فقط)
 */
export async function getAllPartnersActivityStats() {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          lastLoginAt: true,
          lastLoginDevice: true,
        },
      },
    },
  });
  
  const stats = await Promise.all(
    vendors.map(async (vendor) => {
      if (!vendor.user) return null;
      
      const logs = await prisma.userActivityLog.findMany({
        where: { userId: vendor.user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      
      if (logs.length === 0) {
        return {
          vendorId: vendor.id,
          vendorName: vendor.storeName || vendor.user.name || 'غير محدد',
          userId: vendor.user.id,
          email: vendor.user.email,
          totalLogins: 0,
          lastLogin: null,
          devices: [],
          browsers: [],
          locations: [],
          activityLevel: 'خامل',
          recentActivities: [],
        };
      }
      
      const loginLogs = logs.filter(log => log.action === 'LOGIN');
      
      // حساب الأجهزة
      const devicesMap = new Map<string, number>();
      logs.forEach(log => {
        if (log.deviceType) {
          devicesMap.set(log.deviceType, (devicesMap.get(log.deviceType) || 0) + 1);
        }
      });
      
      // حساب المتصفحات
      const browsersMap = new Map<string, number>();
      logs.forEach(log => {
        if (log.browser) {
          browsersMap.set(log.browser, (browsersMap.get(log.browser) || 0) + 1);
        }
      });
      
      // حساب المواقع
      const locationsMap = new Map<string, number>();
      logs.forEach(log => {
        if (log.location) {
          locationsMap.set(log.location, (locationsMap.get(log.location) || 0) + 1);
        }
      });
      
      // تحديد مستوى النشاط
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const recentLogins = loginLogs.filter(log => new Date(log.createdAt) > last7Days);
      
      let activityLevel = 'خامل';
      if (recentLogins.length >= 10) activityLevel = 'نشط جداً';
      else if (recentLogins.length >= 5) activityLevel = 'نشط';
      else if (recentLogins.length >= 2) activityLevel = 'متوسط';
      
      return {
        vendorId: vendor.id,
        vendorName: vendor.storeName || vendor.user.name || 'غير محدد',
        userId: vendor.user.id,
        email: vendor.user.email,
        totalLogins: loginLogs.length,
        lastLogin: loginLogs[0]?.createdAt || null,
        devices: Array.from(devicesMap.entries()).map(([name, count]) => ({ name, count })),
        browsers: Array.from(browsersMap.entries()).map(([name, count]) => ({ name, count })),
        locations: Array.from(locationsMap.entries()).map(([name, count]) => ({ name, count })),
        activityLevel,
        recentActivities: logs.slice(0, 20).map(log => ({
          action: log.action,
          device: log.deviceType,
          browser: log.browser,
          location: log.location,
          createdAt: log.createdAt,
        })),
      };
    })
  );
  
  return stats.filter(Boolean);
}
