import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    const { campaignId } = await request.json();

    // Get campaign insights first
    const insightsUrl = `https://graph.facebook.com/v21.0/${campaignId}/insights?fields=spend,impressions,clicks,ctr,cpc,cpm,frequency&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    const insightsResponse = await fetch(insightsUrl);
    
    if (!insightsResponse.ok) {
      return NextResponse.json({ error: "Could not fetch campaign insights" }, { status: 400 });
    }

    const insightsData = await insightsResponse.json();
    const insights = insightsData.data[0] || {};

    // AI-based optimization suggestions
    let suggestions = "🚀 تحسينات ذكية مقترحة:\n\n";
    
    const ctr = parseFloat(insights.ctr || '0');
    const cpc = parseFloat(insights.cpc || '0');
    const frequency = parseFloat(insights.frequency || '0');
    
    if (ctr < 1.0) {
      suggestions += "• معدل النقر منخفض - جرب تغيير الصورة أو النص الإعلاني\n";
    }
    
    if (cpc > 2.0) {
      suggestions += "• تكلفة النقرة مرتفعة - حسّن الاستهداف أو قلل المنافسة\n";
    }
    
    if (frequency > 3.0) {
      suggestions += "• الإعلان يظهر كثيراً لنفس الأشخاص - وسّع الجمهور\n";
    }
    
    if (ctr >= 1.5) {
      suggestions += "• معدل النقر ممتاز - فكر في زيادة الميزانية لهذه الحملة\n";
    }

    // Apply automatic optimizations where possible
    try {
      // Example: Auto-pause underperforming ads
      if (ctr < 0.5 && parseFloat(insights.spend || '0') > 100) {
        // Could pause the campaign automatically
        suggestions += "• تم اقتراح إيقاف مؤقت للحملة بسبب الأداء الضعيف\n";
      }
    } catch (optimizationError) {
      console.log("Optimization attempt failed:", optimizationError);
    }
    
    return NextResponse.json({
      success: true,
      suggestions,
      insights,
      message: 'Campaign optimization analysis completed'
    });

  } catch (error) {
    console.error('Error optimizing campaign:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}