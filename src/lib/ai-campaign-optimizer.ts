import { prisma } from "./prisma";

interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  recommendation: string;
  action: "INCREASE_BUDGET" | "DECREASE_BUDGET" | "PAUSE" | "KEEP" | "OPTIMIZE";
  reason: string;
}

export class AICampaignOptimizer {
  /**
   * تحليل أداء جميع الحملات النشطة
   */
  async analyzeCampaigns(): Promise<CampaignPerformance[]> {
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    const performances: CampaignPerformance[] = [];

    for (const campaign of campaigns) {
      const performance = await this.analyzeSingleCampaign(campaign.id);
      performances.push(performance);
    }

    return performances;
  }

  /**
   * تحليل حملة واحدة
   */
  async analyzeSingleCampaign(campaignId: string): Promise<CampaignPerformance> {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // حساب الإيرادات من الطلبات المرتبطة بالحملة
    const revenue = await this.calculateCampaignRevenue(campaignId);

    // حساب ROI
    const roi = campaign.spent > 0 ? ((revenue - campaign.spent) / campaign.spent) * 100 : 0;

    // حساب Conversion Rate
    const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;

    // تحديد التوصية والإجراء
    const { recommendation, action, reason } = this.generateRecommendation({
      roi,
      ctr: campaign.ctr,
      cpc: campaign.cpc,
      conversions: campaign.conversions,
      conversionRate,
      spend: campaign.spent,
      budget: campaign.budget,
    });

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      spend: campaign.spent,
      revenue,
      roi,
      ctr: campaign.ctr,
      cpc: campaign.cpc,
      conversions: campaign.conversions,
      conversionRate,
      recommendation,
      action,
      reason,
    };
  }

  /**
   * حساب الإيرادات من الحملة
   */
  private async calculateCampaignRevenue(campaignId: string): Promise<number> {
    // هنا نربط بالطلبات اللي جت من الحملة دي
    // يمكن نستخدم UTM parameters أو cookies
    
    // مؤقتاً: نحسب من الـ conversions * متوسط قيمة الطلب
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return 0;

    // افتراض متوسط قيمة الطلب = 500 جنيه
    const averageOrderValue = 500;
    return campaign.conversions * averageOrderValue;
  }

  /**
   * توليد توصيات ذكية
   */
  private generateRecommendation(metrics: {
    roi: number;
    ctr: number;
    cpc: number;
    conversions: number;
    conversionRate: number;
    spend: number;
    budget: number;
  }): { recommendation: string; action: CampaignPerformance["action"]; reason: string } {
    const { roi, ctr, cpc, conversions, conversionRate, spend, budget } = metrics;

    // ROI ممتاز (أكتر من 200%)
    if (roi > 200) {
      return {
        recommendation: "🚀 حملة ناجحة جداً! زود الميزانية فوراً للاستفادة من الأداء الممتاز",
        action: "INCREASE_BUDGET",
        reason: `ROI عالي جداً: ${roi.toFixed(1)}%`,
      };
    }

    // ROI جيد (100% - 200%)
    if (roi > 100) {
      return {
        recommendation: "✅ حملة مربحة! استمر وراقب الأداء",
        action: "KEEP",
        reason: `ROI جيد: ${roi.toFixed(1)}%`,
      };
    }

    // ROI إيجابي لكن منخفض (0% - 100%)
    if (roi > 0 && roi <= 100) {
      if (ctr < 1) {
        return {
          recommendation: "⚠️ CTR منخفض جداً. حسّن الإعلان أو الاستهداف",
          action: "OPTIMIZE",
          reason: `CTR منخفض: ${ctr.toFixed(2)}%`,
        };
      }

      if (conversionRate < 2) {
        return {
          recommendation: "⚠️ Conversion Rate ضعيف. حسّن الصفحة النهائية أو العرض",
          action: "OPTIMIZE",
          reason: `معدل التحويل منخفض: ${conversionRate.toFixed(2)}%`,
        };
      }

      return {
        recommendation: "📊 حملة مربحة بشكل طفيف. جرب تحسينات A/B Testing",
        action: "OPTIMIZE",
        reason: `ROI منخفض: ${roi.toFixed(1)}%`,
      };
    }

    // ROI سلبي
    if (roi < 0) {
      if (spend < budget * 0.2) {
        return {
          recommendation: "⏳ الحملة جديدة. انتظر المزيد من البيانات",
          action: "KEEP",
          reason: "بيانات غير كافية للحكم",
        };
      }

      if (conversions === 0) {
        return {
          recommendation: "🛑 أوقف الحملة فوراً! لا توجد تحويلات نهائياً",
          action: "PAUSE",
          reason: "لا توجد مبيعات",
        };
      }

      return {
        recommendation: "⚠️ حملة خاسرة! قلل الميزانية أو أوقفها",
        action: "DECREASE_BUDGET",
        reason: `ROI سلبي: ${roi.toFixed(1)}%`,
      };
    }

    return {
      recommendation: "📊 راقب الحملة عن كثب",
      action: "KEEP",
      reason: "بيانات غير واضحة",
    };
  }

  /**
   * تطبيق التحسينات التلقائية
   */
  async applyAutoOptimizations(): Promise<void> {
    const performances = await this.analyzeCampaigns();

    for (const perf of performances) {
      switch (perf.action) {
        case "INCREASE_BUDGET":
          await this.increaseBudget(perf.campaignId, 1.5); // زيادة 50%
          break;
        case "DECREASE_BUDGET":
          await this.decreaseBudget(perf.campaignId, 0.5); // تقليل 50%
          break;
        case "PAUSE":
          await this.pauseCampaign(perf.campaignId);
          break;
      }
    }
  }

  /**
   * زيادة الميزانية
   */
  private async increaseBudget(campaignId: string, multiplier: number): Promise<void> {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return;

    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        budget: campaign.budget * multiplier,
      },
    });
  }

  /**
   * تقليل الميزانية
   */
  private async decreaseBudget(campaignId: string, multiplier: number): Promise<void> {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return;

    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        budget: campaign.budget * multiplier,
      },
    });
  }

  /**
   * إيقاف الحملة
   */
  private async pauseCampaign(campaignId: string): Promise<void> {
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        status: "PAUSED",
      },
    });
  }
}

export const aiOptimizer = new AICampaignOptimizer();
