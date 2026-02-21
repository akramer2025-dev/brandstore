// API to create Catalog Campaign (Dynamic Product Ads)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, budget, message } = body;

    // Validate
    if (!name || !budget || budget < 20) {
      return NextResponse.json(
        { error: 'الاسم والميزانية مطلوبة (الحد الأدنى 20 جنيه)' },
        { status: 400 }
      );
    }

    // Get Facebook credentials from env or database
    let accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    let adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID; 
    let pageId = process.env.FACEBOOK_PAGE_ID;
    const catalogId = '900247573275779'; // Remo Store Bot
    const pixelId = '1242154784695296'; // Meta Pixel ID

    // Try to get from database if not in env
    if (!accessToken) {
      try {
        const dbToken = await prisma.systemSetting.findUnique({
          where: { key: "facebook_access_token" }
        });
        if (dbToken) accessToken = dbToken.value;
        
        const dbAccountId = await prisma.systemSetting.findUnique({
          where: { key: "facebook_ad_account_id" }
        });
        if (dbAccountId) adAccountId = dbAccountId.value;
        
        const dbPageId = await prisma.systemSetting.findUnique({
          where: { key: "facebook_page_id" }
        });
        if (dbPageId) pageId = dbPageId.value;
      } catch (e) {
        console.log("Could not fetch from database, using env only");
      }
    }

    if (!accessToken || !adAccountId || !pageId) {
      return NextResponse.json(
        { error: 'Facebook credentials غير موجودة. أضفها في إعدادات Facebook.' },
        { status: 400 }
      );
    }

    const baseUrl = 'https://graph.facebook.com/v21.0';

    // Step 1: Create Campaign
    console.log('Creating campaign...');
    const campaignResponse = await fetch(`${baseUrl}/${adAccountId}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        objective: 'OUTCOME_SALES', // For catalog sales (Dynamic Product Ads)
        status: 'PAUSED', // Start paused for safety
        special_ad_categories: [],
        access_token: accessToken,
      }),
    });

    const campaignData = await campaignResponse.json();
    if (campaignData.error) {
      console.error('Campaign creation error:', campaignData.error);
      return NextResponse.json(
        { 
          error: `فشل إنشاء الحملة: ${campaignData.error.message}`,
          details: campaignData.error,
        },
        { status: 400 }
      );
    }

    const facebookCampaignId = campaignData.id;
    console.log('Campaign created:', facebookCampaignId);

    // Step 2: Create AdSet with Dynamic Ads
    console.log('Creating ad set...');
    const adSetResponse = await fetch(`${baseUrl}/${adAccountId}/adsets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${name} - Ad Set`,
        campaign_id: facebookCampaignId,
        daily_budget: Math.round(budget * 100), // Convert to cents (e.g., 50 EGP = 5000)
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS', // For catalog sales
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        
        // Targeting: Egypt, Broad
        targeting: {
          geo_locations: { countries: ['EG'] },
          age_min: 18,
          age_max: 65,
        },

        // Dynamic Product Ads settings - requires both catalog and pixel
        promoted_object: {
          product_catalog_id: catalogId,
          pixel_id: pixelId,
        },

        status: 'PAUSED', // Start paused
        access_token: accessToken,
      }),
    });

    const adSetData = await adSetResponse.json();
    if (adSetData.error) {
      console.error('AdSet creation error:', adSetData.error);
      // Rollback: Delete campaign
      await fetch(`${baseUrl}/${facebookCampaignId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });
      return NextResponse.json(
        { 
          error: `فشل إنشاء Ad Set: ${adSetData.error.message}`,
          details: adSetData.error,
        },
        { status: 400 }
      );
    }

    const adSetId = adSetData.id;
    console.log('AdSet created:', adSetId);

    // Step 3: Create Ad Creative (Dynamic Template)
    console.log('Creating ad creative...');
    const creativeResponse = await fetch(`${baseUrl}/${adAccountId}/adcreatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${name} - Creative`,
        object_story_spec: {
          page_id: pageId,
          link_data: {
            link: 'https://www.remostore.net',
            message: message || 'اكتشفي أحدث صيحات الموضة! 🛍️✨\nتسوقي الآن من ريمو ستور\nتوصيل لجميع أنحاء مصر 🚚',
            call_to_action: {
              type: 'SHOP_NOW',
            },
          },
        },
        access_token: accessToken,
      }),
    });

    const creativeData = await creativeResponse.json();
    if (creativeData.error) {
      console.error('Creative creation error:', creativeData.error);
      // Rollback
      await fetch(`${baseUrl}/${facebookCampaignId}`, {
        method: 'DELETE',
        body: JSON.stringify({ access_token: accessToken }),
      });
      return NextResponse.json(
        { 
          error: `فشل إنشاء Creative: ${creativeData.error.message}`,
          details: creativeData.error,
        },
        { status: 400 }
      );
    }

    const creativeId = creativeData.id;
    console.log('Creative created:', creativeId);

    // Step 4: Create Ad
    console.log('Creating ad...');
    const adResponse = await fetch(`${baseUrl}/${adAccountId}/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${name} - Ad`,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'PAUSED', // Start paused for safety
        access_token: accessToken,
      }),
    });

    const adData = await adResponse.json();
    if (adData.error) {
      console.error('Ad creation error:', adData.error);
      // Rollback
      await fetch(`${baseUrl}/${facebookCampaignId}`, {
        method: 'DELETE',
        body: JSON.stringify({ access_token: accessToken }),
      });
      return NextResponse.json(
        { 
          error: `فشل إنشاء الإعلان: ${adData.error.message}`,
          details: adData.error,
        },
        { status: 400 }
      );
    }

    const adId = adData.id;
    console.log('Ad created:', adId);
متوقفة مؤقتاً - يتم تفعيلها يدوياً)
    console.log('Saving campaign to database...');
    const campaign = await prisma.marketingCampaign.create({
      data: {
        name,
        type: 'FACEBOOK_ADS',
        platform: 'FACEBOOK',
        budget,
        status: 'PAUSED',
        targetAudience: 'مصر، 18-65 سنة',
        adCopy: message || 'اكتشفي أحدث صيحات الموضة! 🛍️',
        startDate: new Date(),
        facebookCampaignId: facebookCampaignId,
        facebookAdSetId: adSetId,
        facebookAdId: adId,
        notes: `Dynamic Product Ads - Catalog: ${catalogId} - Pixel: ${pixelId}`,
      },
    });

    console.log('✅ Campaign saved to database:', campaign.id);

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      facebookCampaignId,
      adSetId,
      adId,
      message: '🎉 تم إنشاء حملة الكتالوج بنجاح!\n\n⚠️ الحملة متوقفة مؤقتاً - افتح Facebook Ads Manager لمراجعتها وتفعيلها.\n\nالحملة جاهزة للعمل وتتضمن:\n✅ Catalog: ' + catalogId + '\n✅ Pixel: ' + pixelId
      message: '🎉 تم إنشاء حملة الكتالوج وتفعيلها بنجاح! الإعلان الآن نشط على Facebook',
    });

  } catch (error: any) {
    console.error('Error creating catalog campaign:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الحملة' },
      { status: 500 }
    );
  }
}
