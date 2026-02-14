import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and media buyers can create campaigns
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !["ADMIN", "MARKETING_STAFF"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    
    const {
      campaignId,
      name,
      objective,
      budget,
      locations,
      ageMin,
      ageMax,
      gender,
      interests,
      behaviors,
      platforms,
      placements,
      scheduleType,
      scheduleDays,
      scheduleHours,
      adTitle,
      adMessage,
      adDescription,
      imageUrl,
      targetUrl,
      callToAction,
      bidStrategy,
      optimizationGoal,
    } = data;

    // Validate required fields
    if (!name || !objective || !budget || !adTitle || !adMessage || !targetUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get Facebook credentials from env
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!accessToken || !adAccountId || !pageId) {
      return NextResponse.json(
        { error: "Facebook credentials not configured. Please set up in Facebook Settings." },
        { status: 400 }
      );
    }

    const FB_API_VERSION = "v21.0";
    const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

    // Step 1: Create Campaign
    console.log("Creating campaign...");
    const campaignResponse = await fetch(
      `${FB_BASE_URL}/${adAccountId}/campaigns`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          objective: objective,
          status: "ACTIVE",
          special_ad_categories: ["NONE"],
          access_token: accessToken,
        }),
      }
    );

    if (!campaignResponse.ok) {
      const error = await campaignResponse.text();
      console.error("Campaign creation failed:", error);
      return NextResponse.json(
        { error: "Failed to create campaign on Facebook", details: error },
        { status: 500 }
      );
    }

    const campaignData = await campaignResponse.json();
    const fbCampaignId = campaignData.id;

    // Step 2: Build Advanced Targeting
    const targeting: any = {
      geo_locations: {},
      age_min: ageMin || 18,
      age_max: ageMax || 65,
    };

    // Location targeting
    if (locations && locations.length > 0) {
      // Check if it's country codes or city keys
      const hasCountries = locations.some((loc: string) => loc === "EG");
      const hasCities = locations.some((loc: string) => loc.startsWith("EG-"));

      if (hasCountries && !hasCities) {
        targeting.geo_locations.countries = locations;
      } else if (hasCities) {
        // City targeting - convert keys to city names
        const cityMapping: { [key: string]: string } = {
          "EG-C": "Cairo",
          "EG-GZ": "Giza",
          "EG-ALX": "Alexandria",
          "EG-SUZ": "Suez",
          "EG-IS": "Ismailia",
          "EG-MT": "Mansoura",
          "EG-DK": "Dakahlia",
          "EG-SHR": "Sharqia",
        };
        
        const cities = locations
          .filter((loc: string) => loc.startsWith("EG-"))
          .map((loc: string) => cityMapping[loc])
          .filter(Boolean);

        if (cities.length > 0) {
          targeting.geo_locations.cities = cities.map((city: string) => ({
            key: city.toLowerCase(),
            country: "EG",
          }));
        } else {
          targeting.geo_locations.countries = ["EG"];
        }
      } else {
        targeting.geo_locations.countries = ["EG"];
      }
    } else {
      targeting.geo_locations.countries = ["EG"];
    }

    // Gender targeting
    if (gender && gender !== "all") {
      targeting.genders = [gender === "male" ? 1 : 2];
    }

    // Interests targeting
    if (interests && interests.length > 0) {
      targeting.flexible_spec = [
        {
          interests: interests.map((id: string) => ({ id })),
        },
      ];
    }

    // Behaviors targeting
    if (behaviors && behaviors.length > 0) {
      if (!targeting.flexible_spec) {
        targeting.flexible_spec = [{}];
      }
      targeting.flexible_spec[0].behaviors = behaviors.map((id: string) => ({ id }));
    }

    // Device platforms
    targeting.device_platforms = ["mobile", "desktop"];
    targeting.publisher_platforms = platforms || ["facebook", "instagram"];

    console.log("Advanced Targeting:", JSON.stringify(targeting, null, 2));

    // Step 3: Create AdSet with Advanced Targeting
    const adSetData: any = {
      name: `${name} - AdSet`,
      campaign_id: fbCampaignId,
      billing_event: "IMPRESSIONS",
      optimization_goal: optimizationGoal || "LINK_CLICKS",
      bid_strategy: bidStrategy || "LOWEST_COST_WITHOUT_CAP",
      daily_budget: (budget * 100).toString(), // Convert to cents
      targeting: targeting,
      status: "ACTIVE",
      access_token: accessToken,
    };

    // Add promoted object
    adSetData.promoted_object = {
      page_id: pageId,
    };

    // Scheduling
    if (scheduleType === "custom" && scheduleDays && scheduleDays.length > 0) {
      // Note: Facebook ad scheduling requires specific adset_schedule format
      // For simplicity, we'll handle "always on" vs "custom" at a basic level
      // Full implementation would need day parting configuration
      console.log("Custom scheduling requested:", { scheduleDays, scheduleHours });
    }

    console.log("Creating adset with data:", JSON.stringify(adSetData, null, 2));

    const adSetResponse = await fetch(
      `${FB_BASE_URL}/${adAccountId}/adsets`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adSetData),
      }
    );

    if (!adSetResponse.ok) {
      const error = await adSetResponse.text();
      console.error("AdSet creation failed:", error);
      
      // Try to delete the campaign if adset fails
      await fetch(`${FB_BASE_URL}/${fbCampaignId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });

      return NextResponse.json(
        { error: "Failed to create adset on Facebook", details: error },
        { status: 500 }
      );
    }

    const adSetDataResponse = await adSetResponse.json();
    const fbAdSetId = adSetDataResponse.id;

    // Step 4: Create Ad Creative
    const creativeData: any = {
      name: `${name} - Creative`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          link: targetUrl,
          message: adMessage,
          name: adTitle,
          description: adDescription || "",
          call_to_action: {
            type: callToAction || "SHOP_NOW",
          },
        },
      },
      access_token: accessToken,
    };

    // Add image if provided
    if (imageUrl) {
      creativeData.object_story_spec.link_data.picture = imageUrl;
    }

    const creativeResponse = await fetch(
      `${FB_BASE_URL}/${adAccountId}/adcreatives`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creativeData),
      }
    );

    if (!creativeResponse.ok) {
      const error = await creativeResponse.text();
      console.error("Ad creative creation failed:", error);
      return NextResponse.json(
        { error: "Failed to create ad creative on Facebook", details: error },
        { status: 500 }
      );
    }

    const creativeDataResponse = await creativeResponse.json();
    const fbCreativeId = creativeDataResponse.id;

    // Step 5: Create Ad
    const adData = {
      name: `${name} - Ad`,
      adset_id: fbAdSetId,
      creative: { creative_id: fbCreativeId },
      status: "ACTIVE",
      access_token: accessToken,
    };

    const adResponse = await fetch(`${FB_BASE_URL}/${adAccountId}/ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adData),
    });

    if (!adResponse.ok) {
      const error = await adResponse.text();
      console.error("Ad creation failed:", error);
      return NextResponse.json(
        { error: "Failed to create ad on Facebook", details: error },
        { status: 500 }
      );
    }

    const adDataResponse = await adResponse.json();
    const fbAdId = adDataResponse.id;

    // Step 6: Update campaign in DB
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
        facebookCampaignId: fbCampaignId,
        facebookAdSetId: fbAdSetId,
        facebookAdId: fbAdId,
      },
    });

    return NextResponse.json({
      success: true,
      campaignId: fbCampaignId,
      adSetId: fbAdSetId,
      creativeId: fbCreativeId,
      adId: fbAdId,
      message: "Advanced campaign created successfully on Facebook!",
      targeting: targeting,
    });

  } catch (error: any) {
    console.error("Error creating advanced Facebook campaign:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
