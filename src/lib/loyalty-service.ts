import { prisma } from './prisma';

/**
 * خدمة نظام الولاء والنقاط المتقدم
 */

export const LoyaltyService = {
  /**
   * كسب النقاط
   */
  async earnPoints(userId: string, points: number, type: string, description: string, orderId?: string) {
    try {
      // إضافة النقاط للمستخدم
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points,
          },
        },
      });

      // تسجيل المعاملة
      await prisma.pointTransaction.create({
        data: {
          userId,
          points,
          type: 'EARNED',
          description,
          orderId,
        },
      });

      console.log(`✅ ${userId} earned ${points} points: ${description}`);
      return { success: true, points };
    } catch (error) {
      console.error('❌ Error earning points:', error);
      return { success: false, error };
    }
  },

  /**
   * استخدام النقاط
   */
  async redeemPoints(userId: string, points: number, description: string, orderId?: string) {
    try {
      // التحقق من رصيد النقاط
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user || user.points < points) {
        return {
          success: false,
          error: 'رصيد النقاط غير كافٍ',
          available: user?.points || 0,
          required: points,
        };
      }

      // خصم النقاط
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: points,
          },
        },
      });

      // تسجيل المعاملة
      await prisma.pointTransaction.create({
        data: {
          userId,
          points: -points,
          type: 'REDEEMED',
          description,
          orderId,
        },
      });

      console.log(`✅ ${userId} redeemed ${points} points: ${description}`);
      return { success: true, points, remaining: user.points - points };
    } catch (error) {
      console.error('❌ Error redeeming points:', error);
      return { success: false, error };
    }
  },

  /**
   * حساب النقاط من الشراء
   */
  calculatePointsFromPurchase(amount: number, multiplier: number = 1): number {
    // 1 جنيه = 1 نقطة (افتراضي)
    return Math.floor(amount * multiplier);
  },

  /**
   * تحويل النقاط إلى خصم
   */
  convertPointsToDiscount(points: number, conversionRate: number = 1): number {
    // 100 نقطة = 10 جنيه (افتراضي)
    return (points / 100) * conversionRate * 10;
  },

  /**
   * مكافأة الطلب الأول
   */
  async rewardFirstOrder(userId: string) {
    const orderCount = await prisma.order.count({
      where: { customerId: userId },
    });

    if (orderCount === 1) {
      return await this.earnPoints(
        userId,
        50,
        'FIRST_ORDER',
        '🎉 مكافأة أول طلب - 50 نقطة!'
      );
    }
  },

  /**
   * مكافأة التقييم
   */
  async rewardReview(userId: string, hasImages: boolean = false) {
    const basePoints = 5;
    const imageBonus = hasImages ? 5 : 0;
    const totalPoints = basePoints + imageBonus;

    return await this.earnPoints(
      userId,
      totalPoints,
      'REVIEW',
      `⭐ مكافأة التقييم ${hasImages ? 'مع صورة 📸' : ''} - ${totalPoints} نقطة`
    );
  },

  /**
   * مكافأة الإحالة
   */
  async rewardReferral(referrerId: string, refereeId: string) {
    // نقاط للمُحيل
    await this.earnPoints(
      referrerId,
      100,
      'REFERRAL',
      '👥 مكافأة إحالة صديق - 100 نقطة'
    );

    // نقاط للمُحال
    await this.earnPoints(
      refereeId,
      50,
      'REFERRED',
      '🎁 مكافأة الانضمام عبر إحالة - 50 نقطة'
    );
  },

  /**
   * مكافأة عيد الميلاد
   */
  async rewardBirthday(userId: string) {
    return await this.earnPoints(
      userId,
      100,
      'BIRTHDAY',
      '🎂 عيد ميلاد سعيد! 100 نقطة هدية'
    );
  },

  /**
   * مكافأة الولاء (كل 10 طلبات)
   */
  async rewardLoyalty(userId: string, orderCount: number) {
    if (orderCount % 10 === 0) {
      const points = orderCount * 10; // مثلاً 100 نقطة للطلب العاشر
      return await this.earnPoints(
        userId,
        points,
        'LOYALTY_MILESTONE',
        `🏆 إنجاز الولاء - ${orderCount} طلبات! ${points} نقطة`
      );
    }
  },

  /**
   * الحصول على تاريخ النقاط
   */
  async getPointsHistory(userId: string, limit: number = 50) {
    return await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * إحصائيات النقاط
   */
  async getPointsStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    const transactions = await prisma.pointTransaction.findMany({
      where: { userId },
    });

    const earned = transactions
      .filter(t => t.type === 'EARNED')
      .reduce((sum, t) => sum + t.points, 0);

    const redeemed = transactions
      .filter(t => t.type === 'REDEEMED')
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    return {
      current: user?.points || 0,
      earned,
      redeemed,
      availableDiscount: this.convertPointsToDiscount(user?.points || 0),
    };
  },

  /**
   * مستويات الولاء (VIP Tiers)
   */
  getTierFromPoints(points: number): {
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    name: string;
    benefits: string[];
    nextTier?: string;
    pointsToNext?: number;
  } {
    if (points >= 5000) {
      return {
        tier: 'PLATINUM',
        name: 'بلاتيني 💎',
        benefits: [
          'خصم 20% على جميع المنتجات',
          'شحن مجاني دائماً',
          'وصول مبكر للعروض',
          'دعم ذهبي VIP',
        ],
      };
    } else if (points >= 2000) {
      return {
        tier: 'GOLD',
        name: 'ذهبي ⭐',
        benefits: [
          'خصم 15% على جميع المنتجات',
          'شحن مجاني للطلبات +300 ج',
          'عروض حصرية',
        ],
        nextTier: 'بلاتيني 💎',
        pointsToNext: 5000 - points,
      };
    } else if (points >= 500) {
      return {
        tier: 'SILVER',
        name: 'فضي 🥈',
        benefits: [
          'خصم 10% على منتجات مختارة',
          'شحن مجاني للطلبات +500 ج',
        ],
        nextTier: 'ذهبي ⭐',
        pointsToNext: 2000 - points,
      };
    } else {
      return {
        tier: 'BRONZE',
        name: 'برونزي 🥉',
        benefits: [
          'خصم 5% على الطلب الأول',
          'نقاط على كل عملية شراء',
        ],
        nextTier: 'فضي 🥈',
        pointsToNext: 500 - points,
      };
    }
  },

  /**
   * توصيات الاستبدال
   */
  getRedemptionOptions(points: number) {
    const options = [
      { points: 100, discount: 10, label: 'خصم 10 جنيه' },
      { points: 250, discount: 30, label: 'خصم 30 جنيه' },
      { points: 500, discount: 75, label: 'خصم 75 جنيه' },
      { points: 1000, discount: 200, label: 'خصم 200 جنيه' },
      { points: 2000, discount: 500, label: 'خصم 500 جنيه' },
    ];

    return options.filter(opt => points >= opt.points);
  },

  /**
   * إشعار انتهاء صلاحية النقاط (اختياري)
   */
  async notifyExpiringPoints(userId: string, expiryDays: number = 30) {
    // يمكن إضافة منطق لإشعار المستخدمين بالنقاط القريبة من الانتهاء
    // إذا كان لديك نظام انتهاء للنقاط
    const pointsHistory = await this.getPointsHistory(userId, 100);
    
    // فلترة النقاط التي مضى عليها أكثر من سنة (مثال)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const oldPoints = pointsHistory.filter(
      t => t.createdAt < oneYearAgo && t.type === 'EARNED'
    );

    if (oldPoints.length > 0) {
      const expiringPoints = oldPoints.reduce((sum, t) => sum + t.points, 0);
      return {
        expiring: true,
        points: expiringPoints,
        message: `لديك ${expiringPoints} نقطة ستنتهي صلاحيتها قريباً!`,
      };
    }

    return { expiring: false };
  },
};
