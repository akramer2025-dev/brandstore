import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FacebookMarketing } from "@/lib/facebook-marketing";

/**
 * POST /api/marketing/facebook/create
 * إنشاء حملة جديدة على Facebook وربطها بحملة في قاعدة البيانات
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      campaignId, // ID الحملة في قاعدة البيانات
      targetUrl,
      adMessage,
      adTitle,
      adDescription,
      imageUrl,
    } = body;

    // التحقق من وجود الحملة
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // التحقق من وجود Facebook credentials
    if (!process.env.FACEBOOK_ACCESS_TOKEN || !process.env.FACEBOOK_AD_ACCOUNT_ID) {
      console.error("❌ Facebook credentials missing!");
      return NextResponse.json(
        { 
          error: "Facebook credentials not configured. Please check .env file.",
          details: {
            hasAccessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
            hasAdAccountId: !!process.env.FACEBOOK_AD_ACCOUNT_ID,
            hasPageId: !!process.env.FACEBOOK_PAGE_ID,
          }
        },
        { status: 500 }
      );
    }

    console.log("🚀 Creating Facebook campaign...");
    console.log("Campaign Name:", campaign.name);
    console.log("Budget:", campaign.budget);
    console.log("Target URL:", targetUrl);

    // إنشاء حملة على Facebook
    const fb = new FacebookMarketing();
    
    console.log("📌 About to call createFullCampaign with budget:", campaign.budget);
    
    const { campaignId: fbCampaignId, adSetId, adId } = await fb.createFullCampaign({
      campaignName: campaign.name,
      objective: 'OUTCOME_TRAFFIC', // يمكن تخصيصه حسب نوع الحملة
      budget: campaign.budget,
      targetUrl: targetUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://yourstore.com',
      adMessage: adMessage || `اكتشف ${campaign.name}! 🔥`,
      adTitle: adTitle || campaign.name,
      adDescription: adDescription || 'أفضل العروض والمنتجات',
      imageUrl: imageUrl,
      targetCountries: ['EG'],
    });

    console.log("✅ Facebook campaign created successfully!");
    console.log("Campaign ID:", fbCampaignId);
    console.log("AdSet ID:", adSetId);
    console.log("Ad ID:", adId);

    // تحديث الحملة في قاعدة البيانات
    const updatedCampaign = await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        facebookCampaignId: fbCampaignId,
        facebookAdSetId: adSetId,
        facebookAdId: adId,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      facebook: {
        campaignId: fbCampaignId,
        adSetId,
        adId,
      },
    });
  } catch (error: any) {
    console.error("Facebook campaign creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Facebook campaign" },
      { status: 500 }
    );
  }
}
