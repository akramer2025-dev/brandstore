import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export async function PATCH(
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

    const { name, daily_budget, status } = await request.json();
    const campaignId = params.campaignId;

    // Create update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (daily_budget) updateData.daily_budget = parseInt(daily_budget) * 100; // Facebook expects cents
    if (status) updateData.status = status;

    // Update campaign on Facebook
    const updateUrl = `https://graph.facebook.com/v21.0/${campaignId}`;
    
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updateData,
        access_token: FACEBOOK_ACCESS_TOKEN
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Facebook API error:', error);
      return NextResponse.json({ error: error.error?.message || 'Facebook API error' }, { status: 400 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: data.success || true,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}