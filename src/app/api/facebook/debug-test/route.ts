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

    // Debug configuration
    const debugInfo = {
      hasToken: !!FACEBOOK_ACCESS_TOKEN,
      hasAdAccount: !!FACEBOOK_AD_ACCOUNT,
      adAccount: FACEBOOK_AD_ACCOUNT,
      tokenLength: FACEBOOK_ACCESS_TOKEN?.length || 0
    };

    // Test Facebook API connection
    const testUrl = `https://graph.facebook.com/v21.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    try {
      const testResponse = await fetch(testUrl);
      const testData = await testResponse.json();
      
      if (testResponse.ok) {
        debugInfo.apiTest = { success: true, user: testData.name || testData.id };
      } else {
        debugInfo.apiTest = { success: false, error: testData.error };
      }
    } catch (apiError) {
      debugInfo.apiTest = { success: false, error: 'Network error' };
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('Error in debug test:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}