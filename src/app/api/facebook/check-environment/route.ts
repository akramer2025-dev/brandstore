import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT = process.env.FACEBOOK_AD_ACCOUNT;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 فحص بيئة Facebook API...");

    const checks = {
      accessToken: !!FACEBOOK_ACCESS_TOKEN,
      adAccount: !!FACEBOOK_AD_ACCOUNT,
      pageId: !!FACEBOOK_PAGE_ID,
      tokenValid: false,
      pageAccess: false,
      adAccountAccess: false,
      pageInfo: null,
      adAccountInfo: null
    };

    let results: any = {
      environment: checks,
      errors: [],
      warnings: []
    };

    // Check 1: Access Token
    if (!FACEBOOK_ACCESS_TOKEN) {
      results.errors.push("رمز الوصول (FACEBOOK_ACCESS_TOKEN) غير موجود");
      return NextResponse.json(results);
    }

    // Check 2: Token validity
    console.log("✅ فحص صحة رمز الوصول...");
    try {
      const tokenCheckUrl = `https://graph.facebook.com/v21.0/me?access_token=${FACEBOOK_ACCESS_TOKEN}`;
      const tokenResponse = await fetch(tokenCheckUrl);
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        checks.tokenValid = true;
        results.tokenOwner = tokenData.name;
        console.log("✅ رمز الوصول صالح للمستخدم:", tokenData.name);
      } else {
        const error = await tokenResponse.json();
        results.errors.push(`رمز الوصول غير صالح: ${error.error?.message}`);
        return NextResponse.json(results);
      }
    } catch (e) {
      results.errors.push("خطأ في فحص صحة رمز الوصول");
      return NextResponse.json(results);
    }

    // Check 3: Page access
    if (FACEBOOK_PAGE_ID) {
      console.log("📄 فحص الوصول للصفحة...");
      try {
        const pageUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_PAGE_ID}?fields=id,name,access_token&access_token=${FACEBOOK_ACCESS_TOKEN}`;
        const pageResponse = await fetch(pageUrl);
        
        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          checks.pageAccess = true;
          results.pageInfo = {
            id: pageData.id,
            name: pageData.name,
            hasPageToken: !!pageData.access_token
          };
          console.log("✅ الوصول للصفحة متاح:", pageData.name);
        } else {
          const error = await pageResponse.json();
          results.warnings.push(`لا يمكن الوصول للصفحة: ${error.error?.message}`);
        }
      } catch (e) {
        results.warnings.push("خطأ في فحص الصفحة");
      }
    } else {
      results.errors.push("معرف الصفحة (FACEBOOK_PAGE_ID) غير موجود");
    }

    // Check 4: Ad Account access
    if (FACEBOOK_AD_ACCOUNT) {
      console.log("💰 فحص الوصول للحساب الإعلاني...");
      try {
        const adAccountUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}?fields=id,name,account_status,currency&access_token=${FACEBOOK_ACCESS_TOKEN}`;
        const adAccountResponse = await fetch(adAccountUrl);
        
        if (adAccountResponse.ok) {
          const adAccountData = await adAccountResponse.json();
          checks.adAccountAccess = true;
          results.adAccountInfo = {
            id: adAccountData.id,
            name: adAccountData.name,
            status: adAccountData.account_status,
            currency: adAccountData.currency
          };
          console.log("✅ الوصول للحساب الإعلاني متاح:", adAccountData.name);
        } else {
          const error = await adAccountResponse.json();
          results.warnings.push(`لا يمكن الوصول للحساب الإعلاني: ${error.error?.message}`);
        }
      } catch (e) {
        results.warnings.push("خطأ في فحص الحساب الإعلاني");
      }
    } else {
      results.errors.push("معرف الحساب الإعلاني (FACEBOOK_AD_ACCOUNT) غير موجود");
    }

    // Check 5: Available pages
    console.log("📋 جلب قائمة الصفحات المتاحة...");
    try {
      const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category&access_token=${FACEBOOK_ACCESS_TOKEN}`;
      const pagesResponse = await fetch(pagesUrl);
      
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        results.availablePages = pagesData.data || [];
        console.log(`✅ تم العثور على ${results.availablePages.length} صفحة متاحة`);
      }
    } catch (e) {
      results.warnings.push("لا يمكن جلب قائمة الصفحات");
    }

    // Check 6: Available ad accounts
    console.log("💼 جلب قائمة الحسابات الإعلانية المتاحة...");
    try {
      const adAccountsUrl = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status&access_token=${FACEBOOK_ACCESS_TOKEN}`;
      const adAccountsResponse = await fetch(adAccountsUrl);
      
      if (adAccountsResponse.ok) {
        const adAccountsData = await adAccountsResponse.json();
        results.availableAdAccounts = adAccountsData.data || [];
        console.log(`✅ تم العثور على ${results.availableAdAccounts.length} حساب إعلاني متاح`);
      }
    } catch (e) {
      results.warnings.push("لا يمكن جلب قائمة الحسابات الإعلانية");
    }

    // Overall status
    results.environment = checks;
    results.overallStatus = 
      checks.tokenValid && checks.pageAccess && checks.adAccountAccess ? 'ready' :
      checks.tokenValid ? 'partial' : 'not-ready';

    console.log("🎯 حالة النظام الإجمالية:", results.overallStatus);

    return NextResponse.json(results);

  } catch (error) {
    console.error('خطأ في فحص البيئة:', error);
    return NextResponse.json({ 
      error: "خطأ داخلي في فحص البيئة",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}