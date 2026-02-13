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

    // Get all campaigns first
    const campaignsUrl = `https://graph.facebook.com/v21.0/${FACEBOOK_AD_ACCOUNT}/campaigns?fields=id,name,status,objective&access_token=${FACEBOOK_ACCESS_TOKEN}`;
    const campaignsResponse = await fetch(campaignsUrl);
    
    if (!campaignsResponse.ok) {
      const error = await campaignsResponse.json();
      return NextResponse.json({ error: error.error?.message || 'Failed to fetch campaigns' }, { status: 400 });
    }

    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    // Get all ads for all campaigns
    const allAds = [];
    
    for (const campaign of campaigns) {
      try {
        // Get adsets for this campaign
        const adSetsUrl = `https://graph.facebook.com/v21.0/${campaign.id}/adsets?fields=id,name,status&access_token=${FACEBOOK_ACCESS_TOKEN}`;
        const adSetsResponse = await fetch(adSetsUrl);
        
        if (adSetsResponse.ok) {
          const adSetsData = await adSetsResponse.json();
          const adSets = adSetsData.data || [];
          
          // Get ads for each adset
          for (const adSet of adSets) {
            try {
              const adsUrl = `https://graph.facebook.com/v21.0/${adSet.id}/ads?fields=id,name,status,creative,effective_status,issues_info&access_token=${FACEBOOK_ACCESS_TOKEN}`;
              const adsResponse = await fetch(adsUrl);
              
              if (adsResponse.ok) {
                const adsData = await adsResponse.json();
                const ads = adsData.data || [];
                
                for (const ad of ads) {
                  allAds.push({
                    ...ad,
                    campaign_id: campaign.id,
                    campaign_name: campaign.name,
                    adset_id: adSet.id,
                    adset_name: adSet.name
                  });
                }
              }
            } catch (adError) {
              console.log(`Error fetching ads for adset ${adSet.id}:`, adError);
            }
          }
        }
      } catch (adSetError) {
        console.log(`Error fetching adsets for campaign ${campaign.id}:`, adSetError);
      }
    }

    // Get ads summary by campaign
    const campaignAdsCount = {};
    campaigns.forEach(campaign => {
      const campaignAds = allAds.filter(ad => ad.campaign_id === campaign.id);
      campaignAdsCount[campaign.id] = {
        total: campaignAds.length,
        active: campaignAds.filter(ad => ad.status === 'ACTIVE').length,
        paused: campaignAds.filter(ad => ad.status === 'PAUSED').length,
        rejected: campaignAds.filter(ad => ad.effective_status === 'DISAPPROVED').length,
        pending: campaignAds.filter(ad => ad.effective_status === 'PENDING_REVIEW').length,
        ads: campaignAds
      };
    });

    return NextResponse.json({
      success: true,
      campaigns,
      allAds,
      campaignAdsCount,
      summary: {
        totalCampaigns: campaigns.length,
        totalAds: allAds.length,
        adsWithIssues: allAds.filter(ad => ad.issues_info && ad.issues_info.length > 0).length
      }
    });

  } catch (error) {
    console.error('Error in ads debug:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}