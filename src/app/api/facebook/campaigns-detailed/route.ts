import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT = process.env.FACEBOOK_AD_ACCOUNT;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    // Get campaigns with insights from Facebook
    const campaignsUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time,effective_status,insights{spend,impressions,clicks,ctr,cpc,cpm}&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    const response = await fetch(campaignsUrl);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Facebook API error:', error);
      return NextResponse.json({ error: error.error?.message || 'Facebook API error' }, { status: 400 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      campaigns: data.data || [],
      success: true
    });

  } catch (error) {
    console.error('Error fetching detailed campaigns:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}