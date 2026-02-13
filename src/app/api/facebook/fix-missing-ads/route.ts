import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT = process.env.FACEBOOK_AD_ACCOUNT;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

export async function POST(request: NextRequest) {
  console.log("🚀 ========== FIX MISSING ADS START ==========");
  
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Admin authenticated:", session.user.email);

    if (!FACEBOOK_ACCESS_TOKEN) {
      console.log("❌ FACEBOOK_ACCESS_TOKEN missing");
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    if (!FACEBOOK_AD_ACCOUNT) {
      console.log("❌ FACEBOOK_AD_ACCOUNT missing");
      return NextResponse.json({ error: "Facebook ad account not configured" }, { status: 500 });
    }

    if (!FACEBOOK_PAGE_ID) {
      console.log("❌ FACEBOOK_PAGE_ID missing");
      return NextResponse.json({ error: "Facebook page ID not configured" }, { status: 500 });
    }

    console.log("✅ All environment variables present:");
    console.log("  - Token length:", FACEBOOK_ACCESS_TOKEN.length);
    console.log("  - Ad Account:", FACEBOOK_AD_ACCOUNT);
    console.log("  - Page ID:", FACEBOOK_PAGE_ID);

    console.log("🔧 بدء عملية إصلاح الإعلان المفقود...");

    const requestBody = await request.json();
    const { campaignId } = requestBody;

    console.log("📥 Request body:", requestBody);

    if (!campaignId) {
      console.log("❌ Campaign ID missing from request");
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    console.log("🎯 معرف الحملة:", campaignId);

    // Step 1: Get page access token
    console.log("1️⃣ جلب رمز وصول الصفحة...");
    const pageTokenUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}`;
    
    console.log("🔗 Page Token URL:", pageTokenUrl.replace(FACEBOOK_ACCESS_TOKEN, '***HIDDEN***'));
    
    let pageAccessToken = FACEBOOK_ACCESS_TOKEN;
    
    try {
      const pageTokenResponse = await fetch(pageTokenUrl);
      console.log("📡 Page Token Response Status:", pageTokenResponse.status);
      
      const pageTokenData = await pageTokenResponse.json();
      console.log("📄 Page Token Response Data:", JSON.stringify(pageTokenData, null, 2));
      
      if (!pageTokenResponse.ok) {
        console.error("❌ خطأ في رمز الصفحة:", pageTokenData);
        return NextResponse.json({ 
          error: `فشل في الحصول على رمز الصفحة: ${pageTokenData.error?.message}`,
          fbError: pageTokenData.error
        }, { status: 400 });
      }
      
      console.log("📄 صفحات موجودة:", pageTokenData.data?.length || 0);
      
      if (pageTokenData.data && pageTokenData.data.length > 0) {
        const pageInfo = pageTokenData.data.find((page: any) => page.id === FACEBOOK_PAGE_ID);
        if (pageInfo && pageInfo.access_token) {
          pageAccessToken = pageInfo.access_token;
          console.log("✅ تم الحصول على رمز خاص بالصفحة");
        } else {
          console.log("⚠️ لم يتم العثور على الصفحة المحددة في القائمة");
          console.log("Available pages:", pageTokenData.data.map((p: any) => ({id: p.id, name: p.name})));
        }
      }
    } catch (tokenError) {
      console.log("⚠️ خطأ في جلب رمز الصفحة:", tokenError);
      console.log("⚠️ سيتم استخدام الرمز الأساسي بدلاً من رمز الصفحة");
    }

    // Step 2: Get campaign details
    console.log("2️⃣ جلب تفاصيل الحملة...");
    const campaignUrl = `https://graph.facebook.com/v21.0/${campaignId}?fields=name,objective,status&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    console.log("🔗 Campaign URL:", campaignUrl.replace(FACEBOOK_ACCESS_TOKEN, '***HIDDEN***'));
    
    const campaignResponse = await fetch(campaignUrl);
    console.log("📡 Campaign Response Status:", campaignResponse.status);
    
    if (!campaignResponse.ok) {
      const campaignError = await campaignResponse.json();
      console.error("❌ خطأ في الحملة:", campaignError);
      return NextResponse.json({ 
        error: `الحملة غير موجودة: ${campaignError.error?.message}`,
        fbError: campaignError.error
      }, { status: 400 });
    }

    const campaign = await campaignResponse.json();
    console.log("✅ تفاصيل الحملة:", JSON.stringify(campaign, null, 2));

    // Step 3: Check existing adsets
    console.log("3️⃣ فحص مجموعات الإعلانات الموجودة...");
    const adSetsUrl = `https://graph.facebook.com/v21.0/${campaignId}/adsets?fields=id,name,status,daily_budget&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    console.log("🔗 AdSets URL:", adSetsUrl.replace(FACEBOOK_ACCESS_TOKEN, '***HIDDEN***'));
    
    const adSetsResponse = await fetch(adSetsUrl);
    console.log("📡 AdSets Response Status:", adSetsResponse.status);
    
    let adSetId;
    
    if (adSetsResponse.ok) {
      const adSetsData = await adSetsResponse.json();
      console.log("📄 AdSets Response Data:", JSON.stringify(adSetsData, null, 2));
      
      const adSets = adSetsData.data || [];
      
      console.log("📊 مجموعات إعلانات موجودة:", adSets.length);
      
      if (adSets.length > 0) {
        // Use existing adset
        adSetId = adSets[0].id;
        console.log("♻️ استخدام مجموعة إعلانات موجودة:", adSetId);
      } else {
        // Create new adset
        console.log("4️⃣ إنشاء مجموعة إعلانات جديدة...");
        
        const adSetData = {
          name: `مجموعة إعلانات - ${campaign.name}`,
          campaign_id: campaignId,
          daily_budget: "5000", // 50 EGP
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'REACH',
          targeting: JSON.stringify({
            age_min: 18,
            age_max: 65,
            genders: [0, 1, 2],
            geo_locations: { 
              countries: ['EG'],
              cities: [{ key: 'EG:1536', name: 'Cairo', country: 'EG' }]
            }
          }),
          status: 'ACTIVE',
          access_token: FACEBOOK_ACCESS_TOKEN
        };

        console.log("📝 AdSet Data:", JSON.stringify(adSetData, null, 2));

        const adSetCreateUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/adsets`;
        console.log("🔗 AdSet Create URL:", adSetCreateUrl);
        
        const adSetCreateResponse = await fetch(adSetCreateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(adSetData)
        });

        console.log("📡 AdSet Create Response Status:", adSetCreateResponse.status);

        if (!adSetCreateResponse.ok) {
          const adSetError = await adSetCreateResponse.json();
          console.error("❌ خطأ إنشاء مجموعة الإعلانات:", adSetError);
          return NextResponse.json({ 
            error: `فشل إنشاء مجموعة الإعلانات: ${adSetError.error?.message}`,
            details: adSetError.error,
            suggestion: "تحقق من صلاحيات الحساب الإعلاني"
          }, { status: 400 });
        }

        const adSetResult = await adSetCreateResponse.json();
        console.log("✅ AdSet Creation Result:", JSON.stringify(adSetResult, null, 2));
        adSetId = adSetResult.id;
        console.log("✅ تم إنشاء مجموعة إعلانات:", adSetId);
      }
    } else {
      const adSetError = await adSetsResponse.json();
      console.error("❌ خطأ في جلب مجموعات الإعلانات:", adSetError);
      return NextResponse.json({ 
        error: "لا يمكن الوصول لمجموعات الإعلانات",
        fbError: adSetError.error
      }, { status: 400 });
    }

    // Step 4: Create the ad
    console.log("5️⃣ إنشاء الإعلان...");
    const targetUrl = process.env.PRODUCTION_URL || 'https://www.remostore.net';
    const fallbackImageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop&auto=format&q=80';
    
    console.log("🎯 Target URL:", targetUrl);
    console.log("🖼️ Image URL:", fallbackImageUrl);
    
    // Try with a simple creative first
    const simpleAdData = {
      name: `إعلان - ${campaign.name}`,
      adset_id: adSetId,
      creative: JSON.stringify({
        object_story_spec: {
          page_id: FACEBOOK_PAGE_ID,
          link_data: {
            image_url: fallbackImageUrl,
            link: targetUrl,
            message: `🔥 عروض حصرية من RemoStore! تسوق الآن 🛍️`,
            call_to_action: {
              type: 'LEARN_MORE',
              value: { link: targetUrl }
            }
          }
        }
      }),
      status: 'ACTIVE',
      access_token: pageAccessToken
    };

    console.log("📝 Simple Ad Data:", JSON.stringify(simpleAdData, null, 2));

    const adCreateUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/ads`;
    
    console.log("🔗 Ad Create URL:", adCreateUrl);
    console.log("📄 معرف الصفحة:", FACEBOOK_PAGE_ID);
    console.log("💰 معرف الحساب الإعلاني:", FACEBOOK_AD_ACCOUNT);
    
    const adCreateResponse = await fetch(adCreateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(simpleAdData)
    });

    console.log("📡 Ad Create Response Status:", adCreateResponse.status);

    if (!adCreateResponse.ok) {
      const adError = await adCreateResponse.json();
      console.error('❌ خطأ إنشاء الإعلان:', JSON.stringify(adError, null, 2));
      
      // Try even simpler approach with just text
      console.log("6️⃣ المحاولة بإعلان نصي فقط...");
      
      const textOnlyAdData = {
        name: `إعلان نصي - ${campaign.name}`,
        adset_id: adSetId,
        creative: JSON.stringify({
          object_story_spec: {
            page_id: FACEBOOK_PAGE_ID,
            link_data: {
              link: targetUrl,
              message: `عروض حصرية من RemoStore! تسوق الآن واحصل على خصومات مميزة 🛒`
            }
          }
        }),
        status: 'ACTIVE',
        access_token: pageAccessToken
      };

      console.log("📝 Text Only Ad Data:", JSON.stringify(textOnlyAdData, null, 2));

      const textAdResponse = await fetch(adCreateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(textOnlyAdData)
      });

      console.log("📡 Text Ad Response Status:", textAdResponse.status);

      if (!textAdResponse.ok) {
        const textAdError = await textAdResponse.json();
        console.error('❌ الإعلان النصي فشل أيضاً:', JSON.stringify(textAdError, null, 2));
        
        console.log("🚨 ========== COMPLETE FAILURE - RETURNING ERROR ==========");
        
        return NextResponse.json({ 
          error: `فشل في إنشاء أي نوع من الإعلانات`,
          originalError: adError.error?.message,
          originalErrorFull: adError.error,
          textError: textAdError.error?.message,
          textErrorFull: textAdError.error,
          suggestion: "تحقق من صلاحيات الصفحة والحساب الإعلاني أو جرّب من Facebook Ads Manager مباشرة",
          debugInfo: {
            pageId: FACEBOOK_PAGE_ID,
            adAccount: FACEBOOK_AD_ACCOUNT,
            campaignId: campaignId,
            adSetId: adSetId
          }
        }, { status: 400 });
      }

      const textAdResult = await textAdResponse.json();
      console.log("✅ Text Ad Creation Success:", JSON.stringify(textAdResult, null, 2));

      console.log("🎊 ========== TEXT AD SUCCESS ==========");

      return NextResponse.json({
        success: true,
        message: '✅ تم إنشاء إعلان نصي بسيط بنجاح!',
        ad: {
          id: textAdResult.id,
          name: textOnlyAdData.name,
          adset_id: adSetId,
          campaign_id: campaignId,
          type: 'text-only'
        }
      });
    }

    const adResult = await adCreateResponse.json();
    console.log("🎉 Full Ad Creation Success:", JSON.stringify(adResult, null, 2));

    console.log("🎊 ========== FULL AD SUCCESS ==========");

    return NextResponse.json({
      success: true,
      message: '🎉 تم إنشاء الإعلان بنجاح!',
      ad: {
        id: adResult.id,
        name: simpleAdData.name,
        adset_id: adSetId,
        campaign_id: campaignId,
        type: 'with-image'
      }
    });

  } catch (error) {
    console.error('🚨 خطأ عام في إنشاء الإعلان:', error);
    console.log("🚨 ========== GENERAL ERROR ==========");
    return NextResponse.json({ 
      error: "خطأ داخلي في النظام",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    console.log("🏁 ========== FIX MISSING ADS END ==========");
  }
}