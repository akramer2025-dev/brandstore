import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    const campaignId = params.campaignId;

    // Get adsets from Facebook
    const adsetsUrl = `https://graph.facebook.com/v21.0/${campaignId}/adsets?fields=id,name,campaign_id,status,daily_budget,targeting,created_time&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    const response = await fetch(adsetsUrl);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Facebook API error:', error);
      return NextResponse.json({ error: error.error?.message || 'Facebook API error' }, { status: 400 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      adsets: data.data || [],
      success: true
    });

  } catch (error) {
    console.error('Error fetching adsets:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}