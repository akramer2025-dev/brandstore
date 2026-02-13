import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT = process.env.FACEBOOK_AD_ACCOUNT;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

export async function GET(request: NextRequest) {
  console.log("🧪 ========== FACEBOOK API TEST START ==========");
  
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Admin authenticated:", session.user.email);

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        hasAccessToken: !!FACEBOOK_ACCESS_TOKEN,
        accessTokenLength: FACEBOOK_ACCESS_TOKEN?.length || 0,
        hasAdAccount: !!FACEBOOK_AD_ACCOUNT,
        adAccount: FACEBOOK_AD_ACCOUNT,
        hasPageId: !!FACEBOOK_PAGE_ID,
        pageId: FACEBOOK_PAGE_ID
      },
      tests: {} as any
    };

    if (!FACEBOOK_ACCESS_TOKEN) {
      console.log("❌ No access token");
      return NextResponse.json({
        error: "Facebook access token not configured",
        results
      }, { status: 400 });
    }

    // Test 1: Basic token validity
    console.log("🧪 Test 1: Token validity...");
    try {
      const tokenTestUrl = `https://graph.facebook.com/v21.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`;
      const tokenTestResponse = await fetch(tokenTestUrl);
      const tokenTestData = await tokenTestResponse.json();
      
      results.tests.tokenTest = {
        success: tokenTestResponse.ok,
        status: tokenTestResponse.status,
        data: tokenTestData
      };

      console.log(`${tokenTestResponse.ok ? '✅' : '❌'} Token test:`, tokenTestResponse.status);
    } catch (e) {
      results.tests.tokenTest = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
      console.log("❌ Token test failed:", e);
    }

    // Test 2: Page access
    if (FACEBOOK_PAGE_ID) {
      console.log("🧪 Test 2: Page access...");
      try {
        const pageTestUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_PAGE_ID}?fields=id,name,category&access_token=${FACEBOOK_ACCESS_TOKEN}`;
        const pageTestResponse = await fetch(pageTestUrl);
        const pageTestData = await pageTestResponse.json();
        
        results.tests.pageTest = {
          success: pageTestResponse.ok,
          status: pageTestResponse.status,
          data: pageTestData
        };

        console.log(`${pageTestResponse.ok ? '✅' : '❌'} Page test:`, pageTestResponse.status);
      } catch (e) {
        results.tests.pageTest = {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        };
        console.log("❌ Page test failed:", e);
      }
    }

    // Test 3: Ad account access
    if (FACEBOOK_AD_ACCOUNT) {
      console.log("🧪 Test 3: Ad account access...");
      try {
        const adAccountTestUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}?fields=id,name,account_status,currency&access_token=${FACEBOOK_ACCESS_TOKEN}`;
        const adAccountTestResponse = await fetch(adAccountTestUrl);
        const adAccountTestData = await adAccountTestResponse.json();
        
        results.tests.adAccountTest = {
          success: adAccountTestResponse.ok,
          status: adAccountTestResponse.status,
          data: adAccountTestData
        };

        console.log(`${adAccountTestResponse.ok ? '✅' : '❌'} Ad account test:`, adAccountTestResponse.status);
      } catch (e) {
        results.tests.adAccountTest = {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        };
        console.log("❌ Ad account test failed:", e);
      }
    }

    // Test 4: Pages list
    console.log("🧪 Test 4: Available pages...");
    try {
      const pagesTestUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category&access_token=${FACEBOOK_ACCESS_TOKEN}`;
      const pagesTestResponse = await fetch(pagesTestUrl);
      const pagesTestData = await pagesTestResponse.json();
      
      results.tests.pagesTest = {
        success: pagesTestResponse.ok,
        status: pagesTestResponse.status,
        data: pagesTestData
      };

      console.log(`${pagesTestResponse.ok ? '✅' : '❌'} Pages test:`, pagesTestResponse.status);
    } catch (e) {
      results.tests.pagesTest = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
      console.log("❌ Pages test failed:", e);
    }

    // Test 5: Ad accounts list
    console.log("🧪 Test 5: Available ad accounts...");
    try {
      const adAccountsTestUrl = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status&access_token=${FACEBOOK_ACCESS_TOKEN}`;
      const adAccountsTestResponse = await fetch(adAccountsTestUrl);
      const adAccountsTestData = await adAccountsTestResponse.json();
      
      results.tests.adAccountsTest = {
        success: adAccountsTestResponse.ok,
        status: adAccountsTestResponse.status,
        data: adAccountsTestData
      };

      console.log(`${adAccountsTestResponse.ok ? '✅' : '❌'} Ad accounts test:`, adAccountsTestResponse.status);
    } catch (e) {
      results.tests.adAccountsTest = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
      console.log("❌ Ad accounts test failed:", e);
    }

    // Summary
    const successfulTests = Object.values(results.tests).filter((test: any) => test.success).length;
    const totalTests = Object.keys(results.tests).length;
    
    results.summary = {
      successfulTests,
      totalTests,
      overallSuccess: successfulTests === totalTests
    };

    console.log(`🎯 Tests completed: ${successfulTests}/${totalTests} successful`);
    console.log("🧪 ========== FACEBOOK API TEST END ==========");

    return NextResponse.json(results);

  } catch (error) {
    console.error('🚨 Test error:', error);
    console.log("🧪 ========== FACEBOOK API TEST ERROR ==========");
    return NextResponse.json({ 
      error: "Internal server error during testing",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}