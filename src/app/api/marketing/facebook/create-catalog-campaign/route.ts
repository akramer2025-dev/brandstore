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

    // Get Facebook credentials from env
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID; // act_1962278932225
    const pageId = process.env.FACEBOOK_PAGE_ID; // 103042954595602
    const catalogId = '900247573275779'; // Remo Store Bot

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
        objective: 'OUTCOME_TRAFFIC', // For catalog traffic (compatible with Dynamic Ads)
        status: 'PAUSED', // Start paused, will be activated after setup
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
        daily_budget: Math.round(budget * 100), // Convert to cents
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS', // For catalog clicks (compatible with v21.0)
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        
        // Targeting: Egypt, Broad
        targeting: {
          geo_locations: { countries: ['EG'] },
          age_min: 18,
          age_max: 65,
        },

        // Dynamic Product Ads settings
        promoted_object: {
          product_catalog_id: catalogId,
        },

        status: 'PAUSED',
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
        status: 'PAUSED',
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

    // Step 5: Activate Campaign (set to ACTIVE)
    console.log('Activating campaign...');
    await fetch(`${baseUrl}/${facebookCampaignId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ACTIVE',
        access_token: accessToken,
      }),
    });

    await fetch(`${baseUrl}/${adSetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ACTIVE',
        access_token: accessToken,
      }),
    });

    await fetch(`${baseUrl}/${adId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ACTIVE',
        access_token: accessToken,
      }),
    });

    // Step 6: Save to database
    const campaign = await prisma.marketingCampaign.create({
      data: {
        name,
        type: 'FACEBOOK_ADS',
        platform: 'FACEBOOK',
        budget,
        status: 'ACTIVE',
        targetAudience: 'مصر، 18-65 سنة',
        adCopy: message || 'اكتشفي أحدث صيحات الموضة! 🛍️',
        startDate: new Date(),
        facebookCampaignId: facebookCampaignId,
        facebookAdSetId: adSetId,
        facebookAdId: adId,
        notes: 'إعلان ديناميكي للكتالوج - Campaign created automatically',
      },
    });

    console.log('✅ Campaign saved to database:', campaign.id);

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      facebookCampaignId,
      message: 'تم إنشاء حملة الكتالوج بنجاح! 🎉',
    });

  } catch (error: any) {
    console.error('Error creating catalog campaign:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الحملة' },
      { status: 500 }
    );
  }
}
