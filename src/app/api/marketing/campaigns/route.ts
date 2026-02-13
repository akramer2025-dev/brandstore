import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();

    const campaign = await prisma.marketingCampaign.create({
      data: {
        name: body.name,
        type: body.type,
        types: body.types || null, // حفظ الأنواع المتعددة
        platform: body.platform,
        budget: body.budget,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        roi: 0,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        targetAudience: body.targetAudience || null,
        keywords: body.keywords || null,
        adCopy: body.adCopy || null,
        facebookCampaignId: body.facebookCampaignId || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "فشل إنشاء الحملة" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "فشل جلب الحملات" }, { status: 500 });
  }
}
