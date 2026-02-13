import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FacebookMarketing } from "@/lib/facebook-marketing";

/**
 * POST /api/marketing/facebook/sync
 * مزامنة بيانات الحملة من Facebook
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId } = body;

    // التحقق من وجود الحملة
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (!campaign.facebookCampaignId) {
      return NextResponse.json(
        { error: "Campaign not linked to Facebook" },
        { status: 400 }
      );
    }

    // جلب البيانات من Facebook
    const fb = new FacebookMarketing();
    const insights = await fb.syncCampaignData(campaign.facebookCampaignId);

    if (!insights) {
      return NextResponse.json(
        { error: "Failed to fetch data from Facebook" },
        { status: 500 }
      );
    }

    // تحديث قاعدة البيانات
    const updatedCampaign = await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        impressions: insights.impressions,
        clicks: insights.clicks,
        spent: insights.spent,
        ctr: insights.ctr,
        conversions: insights.conversions,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      insights,
    });
  } catch (error: any) {
    console.error("Facebook sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync with Facebook" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketing/facebook/sync?all=true
 * مزامنة جميع الحملات المربوطة بفيسبوك
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // جلب كل الحملات المربوطة بفيسبوك
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        facebookCampaignId: {
          not: null,
        },
      },
    });

    const fb = new FacebookMarketing();
    const results = [];

    for (const campaign of campaigns) {
      try {
        const insights = await fb.syncCampaignData(campaign.facebookCampaignId!);
        
        if (insights) {
          await prisma.marketingCampaign.update({
            where: { id: campaign.id },
            data: {
              impressions: insights.impressions,
              clicks: insights.clicks,
              spent: insights.spent,
              ctr: insights.ctr,
              conversions: insights.conversions,
            },
          });

          results.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            synced: true,
            insights,
          });
        }
      } catch (error) {
        console.error(`Failed to sync campaign ${campaign.id}:`, error);
        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          synced: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: results.filter(r => r.synced).length,
      totalCount: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Facebook sync all error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync campaigns" },
      { status: 500 }
    );
  }
}
