import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT = process.env.FACEBOOK_AD_ACCOUNT;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!FACEBOOK_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    const { name, objective, daily_budget, target_description, ad_text, image_url } = await request.json();

    // Get page access token first
    const pageTokenUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}`;
    const pageTokenResponse = await fetch(pageTokenUrl);
    const pageTokenData = await pageTokenResponse.json();
    
    const pageInfo = pageTokenData.data?.find((page: any) => page.id === FACEBOOK_PAGE_ID);
    const pageAccessToken = pageInfo?.access_token || FACEBOOK_ACCESS_TOKEN;

    // Step 1: Create Campaign
    const campaignData = {
      name,
      objective,
      status: 'PAUSED', // Start paused for safety
      special_ad_categories: '[]',
      buying_type: 'AUCTION',
      is_skadnetwork_attribution: false,
      access_token: FACEBOOK_ACCESS_TOKEN
    };

    const campaignUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/campaigns`;
    const campaignResponse = await fetch(campaignUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(campaignData)
    });

    if (!campaignResponse.ok) {
      const campaignError = await campaignResponse.json();
      return NextResponse.json({ error: campaignError.error?.message || 'Campaign creation failed' }, { status: 400 });
    }

    const campaignResult = await campaignResponse.json();
    const campaignId = campaignResult.id;

    // Step 2: Create AdSet
    const adSetData = {
      name: `AdSet - ${name}`,
      campaign_id: campaignId,
      daily_budget: (parseFloat(daily_budget) * 100).toString(), // Facebook expects cents
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_amount: Math.round(parseFloat(daily_budget) * 10).toString(), // 10% of daily budget
      targeting: JSON.stringify({
        age_min: 18,
        age_max: 65,
        genders: [0, 1, 2],
        geo_locations: { countries: ['EG'] },
        interests: target_description ? [{ id: '6003107902433', name: 'Shopping and fashion' }] : []
      }),
      status: 'PAUSED',
      is_adset_budget_sharing_enabled: false,
      access_token: FACEBOOK_ACCESS_TOKEN
    };

    const adSetUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/adsets`;
    const adSetResponse = await fetch(adSetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(adSetData)
    });

    if (!adSetResponse.ok) {
      const adSetError = await adSetResponse.json();
      return NextResponse.json({ error: adSetError.error?.message || 'AdSet creation failed' }, { status: 400 });
    }

    const adSetResult = await adSetResponse.json();
    const adSetId = adSetResult.id;

    // Step 3: Create Ad
    const targetUrl = process.env.PRODUCTION_URL || 'https://www.remostore.net';
    const fallbackImageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop';
    
    const adData = {
      name: `Ad - ${name}`,
      adset_id: adSetId,
      creative: JSON.stringify({
        object_story_spec: {
          page_id: FACEBOOK_PAGE_ID,
          link_data: {
            image_url: image_url || fallbackImageUrl,
            link: targetUrl,
            message: ad_text || `اكتشف أحدث العروض في ${name}`,
            name: name,
            call_to_action: {
              type: 'LEARN_MORE',
              value: { link: targetUrl }
            }
          }
        }
      }),
      status: 'PAUSED',
      access_token: pageAccessToken
    };

    const adUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/ads`;
    const adResponse = await fetch(adUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(adData)
    });

    if (!adResponse.ok) {
      const adError = await adResponse.json();
      return NextResponse.json({ error: adError.error?.message || 'Ad creation failed' }, { status: 400 });
    }

    const adResult = await adResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      campaign: {
        campaignId,
        adSetId,
        adId: adResult.id,
        name,
        status: 'PAUSED'
      }
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}