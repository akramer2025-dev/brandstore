import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/marketing/facebook/test
 * Test Facebook API credentials
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    // Check if credentials exist
    if (!accessToken || !adAccountId || !pageId) {
      return NextResponse.json({
        success: false,
        error: "Missing Facebook credentials",
        details: {
          hasAccessToken: !!accessToken,
          hasAdAccountId: !!adAccountId,
          hasPageId: !!pageId,
        },
      });
    }

    // Test Facebook Graph API connection
    const testUrl = `https://graph.facebook.com/v21.0/me?access_token=${accessToken}`;
    
    try {
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: "Facebook API Error",
          details: data,
        });
      }

      // Test Ad Account access
      const adAccountUrl = `https://graph.facebook.com/v21.0/${adAccountId}?fields=name,account_status,age,currency&access_token=${accessToken}`;
      const adAccountResponse = await fetch(adAccountUrl);
      const adAccountData = await adAccountResponse.json();

      if (!adAccountResponse.ok) {
        return NextResponse.json({
          success: false,
          error: "Cannot access Ad Account",
          details: adAccountData,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Facebook API credentials are valid!",
        user: {
          id: data.id,
          name: data.name,
        },
        adAccount: {
          id: adAccountData.id,
          name: adAccountData.name,
          status: adAccountData.account_status,
          currency: adAccountData.currency,
        },
        credentials: {
          hasAccessToken: true,
          hasAdAccountId: true,
          hasPageId: true,
          adAccountId: adAccountId,
          pageId: pageId,
        },
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: "Failed to connect to Facebook API",
        details: error.message,
      });
    }
  } catch (error: any) {
    console.error("Facebook test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to test Facebook connection" 
      },
      { status: 500 }
    );
  }
}
