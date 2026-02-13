/**
 * Facebook Marketing API Integration
 * للتعامل مع Facebook Ads Manager وإنشاء حملات حقيقية
 */

interface FacebookCampaignData {
  name: string;
  objective: string; // 'OUTCOME_TRAFFIC' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_SALES' | 'OUTCOME_LEADS'
  status: 'ACTIVE' | 'PAUSED';
  special_ad_categories: string[];
}

interface FacebookAdSetData {
  name: string;
  campaign_id: string;
  daily_budget: number;
  billing_event: 'IMPRESSIONS' | 'LINK_CLICKS';
  optimization_goal: 'REACH' | 'LINK_CLICKS' | 'IMPRESSIONS' | 'OFFSITE_CONVERSIONS';
  targeting: {
    geo_locations: {
      countries: string[];
    };
    age_min?: number;
    age_max?: number;
  };
  status: 'ACTIVE' | 'PAUSED';
}

interface FacebookAdData {
  name: string;
  adset_id: string;
  creative: {
    object_story_spec: {
      page_id: string;
      link_data: {
        link: string;
        message: string;
        name: string;
        description?: string;
        picture?: string;
      };
    };
  };
  status: 'ACTIVE' | 'PAUSED';
}

export class FacebookMarketing {
  private accessToken: string;
  private adAccountId: string;
  private pageId: string;
  private pageAccessToken: string | null = null;
  private apiVersion = 'v21.0';

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
    this.adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID || '';
    this.pageId = process.env.FACEBOOK_PAGE_ID || '';
  }

  /**
   * Get Page Access Token (needed for creating Ads)
   */
  private async getPageAccessToken(): Promise<string> {
    if (this.pageAccessToken) {
      return this.pageAccessToken;
    }

    try {
      // Try to get page access token from /me/accounts
      const url = `https://graph.facebook.com/${this.apiVersion}/me/accounts?access_token=${this.accessToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log("⚠️ Could not fetch page access token, using user access token");
        return this.accessToken;
      }

      const data = await response.json();
      const page = data.data?.find((p: any) => p.id === this.pageId);
      
      if (page?.access_token) {
        console.log("✅ Using Page Access Token for Ad creation");
        this.pageAccessToken = page.access_token;
        return page.access_token;
      }
      
      console.log("⚠️ Page access token not found, using user access token");
      return this.accessToken;
    } catch (error) {
      console.log("⚠️ Error getting page access token:", error);
      return this.accessToken;
    }
  }

  /**
   * Helper: Retry logic for transient errors
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 2000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Check if error is transient (should retry)
        const errorMessage = error.message || '';
        const isTransient = 
          errorMessage.includes('"is_transient":true') ||
          errorMessage.includes('"code":2') ||
          errorMessage.includes('"code":1') ||
          errorMessage.includes('"code":17');
        
        if (!isTransient || attempt === maxRetries) {
          throw error;
        }
        
        console.log(`⚠️ Transient error, retrying (${attempt}/${maxRetries})...`);
        console.log(`⏱️ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
      }
    }
    
    throw lastError;
  }

  /**
   * إنشاء حملة جديدة على Facebook
   */
  async createCampaign(data: FacebookCampaignData) {
    return this.retryRequest(async () => {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.adAccountId}/campaigns`;
      
      console.log("📤 Creating Campaign (AdSet Budget Mode)");
      
      const params = new URLSearchParams({
        name: data.name,
        objective: data.objective,
        status: data.status,
        special_ad_categories: JSON.stringify(data.special_ad_categories || []),
        access_token: this.accessToken,
      });
      
      // ✅ إخبار Facebook إننا هنستخدم AdSet budgets (مش Campaign budget)
      params.append('is_adset_budget_sharing_enabled', 'false');
      
      console.log("✅ Campaign URL includes is_adset_budget_sharing_enabled");
      
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Facebook API Error (Create Campaign):", error);
        throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      console.log("✅ Campaign created:", result.id);
      return result.id; // Campaign ID
    });
  }

  /**
   * إنشاء Ad Set (مجموعة إعلانات)
   */
  async createAdSet(data: FacebookAdSetData) {
    return this.retryRequest(async () => {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.adAccountId}/adsets`;
      
      console.log("📤 Server: Creating AdSet with budget:", data.daily_budget);
      
      // Facebook API requires form-urlencoded for AdSets (not JSON!)
      const formBody = new URLSearchParams();
      formBody.append('name', data.name);
      formBody.append('campaign_id', data.campaign_id);
      formBody.append('daily_budget', data.daily_budget.toString());
      formBody.append('billing_event', data.billing_event);
      formBody.append('optimization_goal', data.optimization_goal);
      formBody.append('targeting', JSON.stringify(data.targeting));
      formBody.append('status', data.status);
      formBody.append('is_adset_budget_sharing_enabled', 'false'); // ✅ Must be string
      
      // ✅ إضافة bid_amount (الحد الأقصى لعرض السعر) - عادة 10% من الميزانية
      const bidAmount = Math.round(data.daily_budget * 0.1); // 10% من daily_budget
      formBody.append('bid_amount', bidAmount.toString());
      
      formBody.append('access_token', this.accessToken);
      
      console.log("✅ Form body includes is_adset_budget_sharing_enabled:", formBody.has('is_adset_budget_sharing_enabled'));
      console.log("✅ bid_amount:", bidAmount, "(10% of daily_budget)");
      console.log("✅ Value:", formBody.get('is_adset_budget_sharing_enabled'));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Facebook API Error (Create AdSet):", error);
        throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      return result.id; // AdSet ID
    });
  }

  /**
   * إنشاء Ad Creative (منفصل عن الإعلان نفسه)
   */
  async createAdCreative(data: {
    name: string;
    page_id: string;
    link: string;
    message: string;
    title: string;
    description?: string;
    picture?: string;
  }) {
    return this.retryRequest(async () => {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.adAccountId}/adcreatives`;
      
      // ✅ استخدام Page Access Token
      const token = await this.getPageAccessToken();
      
      console.log("🎨 Creating Ad Creative...");
      console.log("📄 Data:", JSON.stringify(data, null, 2));
      
      const creativeData = {
        name: data.name,
        object_story_spec: {
          page_id: data.page_id,
          link_data: {
            link: data.link,
            message: data.message,
            name: data.title,
            ...(data.description && { description: data.description }),
            ...(data.picture && { picture: data.picture }),
          },
        },
      };
      
      const params = new URLSearchParams({
        name: creativeData.name,
        object_story_spec: JSON.stringify(creativeData.object_story_spec),
        access_token: token,
      });
      
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Facebook API Error (Create Creative):", error);
        throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      console.log("✅ Ad Creative created:", result.id);
      return result.id; // Creative ID
    });
  }

  /**
   * إنشاء إعلان
   */
  async createAd(data: FacebookAdData & { creative_id?: string }) {
    return this.retryRequest(async () => {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.adAccountId}/ads`;
      
      // ✅ استخدام Page Access Token للـ Ads (مهم جداً!)
      const token = await this.getPageAccessToken();
      
      // إذا في creative_id جاهز، استخدمه
      // وإلا استخدم inline creative
      const params = new URLSearchParams({
        name: data.name,
        adset_id: data.adset_id,
        status: data.status,
        access_token: token,
      });
      
      if (data.creative_id) {
        params.append('creative', JSON.stringify({ creative_id: data.creative_id }));
      } else {
        params.append('creative', JSON.stringify(data.creative));
      }
      
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Facebook API Error (Create Ad):", error);
        throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      console.log("✅ Ad created:", result.id);
      return result.id; // Ad ID
    });
  }

  /**
   * جلب إحصائيات حملة من Facebook
   */
  async getCampaignInsights(campaignId: string) {
    const url = `https://graph.facebook.com/${this.apiVersion}/${campaignId}/insights`;
    
    const params = new URLSearchParams({
      fields: 'impressions,clicks,spend,reach,cpc,ctr,conversions,cost_per_conversion',
      access_token: this.accessToken,
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    return result.data?.[0] || null;
  }

  /**
   * تحديث حالة حملة (تشغيل/إيقاف)
   */
  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED') {
    const url = `https://graph.facebook.com/${this.apiVersion}/${campaignId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        access_token: this.accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * تحديث ميزانية Ad Set
   */
  async updateAdSetBudget(adSetId: string, dailyBudget: number) {
    const url = `https://graph.facebook.com/${this.apiVersion}/${adSetId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        daily_budget: dailyBudget,
        access_token: this.accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * إنشاء حملة كاملة (Campaign + AdSet + Ad)
   */
  async createFullCampaign(params: {
    campaignName: string;
    objective: string;
    budget: number; // EGP
    targetUrl: string;
    adMessage: string;
    adTitle: string;
    adDescription?: string;
    imageUrl?: string;
    targetCountries?: string[];
  }) {
    try {
      // 1. إنشاء Campaign بدون budget
      console.log("🎯 Step 1: Creating Campaign...");
      const campaignId = await this.createCampaign({
        name: params.campaignName,
        objective: params.objective as any,
        status: 'ACTIVE',
        special_ad_categories: [],
      });
      console.log("✅ Campaign created:", campaignId);

      // 2. إنشاء AdSet مع daily_budget
      console.log("🎯 Step 2: Creating AdSet with budget...");
      
      const adSetId = await this.createAdSet({
        name: `${params.campaignName} - AdSet`,
        campaign_id: campaignId,
        daily_budget: Math.round(params.budget * 100),
        billing_event: 'LINK_CLICKS',
        optimization_goal: 'LINK_CLICKS',
        targeting: {
          geo_locations: {
            countries: params.targetCountries || ['EG'],
          },
          age_min: 18,
          age_max: 65,
        },
        status: 'ACTIVE',
      });

      // 3. التحقق من الـ URLs وإصلاحها
      console.log("🎯 Step 3: Preparing Ad Assets...");
      console.log("📸 Image URL:", params.imageUrl);
      console.log("🔗 Target URL:", params.targetUrl);
      
      // التأكد من أن الصورة URL صحيح
      let validImageUrl = params.imageUrl;
      if (!validImageUrl || 
          validImageUrl.includes('localhost') || 
          validImageUrl.includes('127.0.0.1') ||
          validImageUrl.startsWith('/') || 
          !validImageUrl.startsWith('http')) {
        validImageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop';
        console.log("⚠️ Using fallback image:", validImageUrl);
      }
      
      // التأكد من أن الـ Target URL مش localhost
      let validTargetUrl = params.targetUrl;
      if (!validTargetUrl || validTargetUrl.includes('localhost') || validTargetUrl.includes('127.0.0.1')) {
        // استخدام production URL من .env (مخصص للـ Facebook Ads)
        validTargetUrl = process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.remostore.net';
        console.log("⚠️ localhost URL detected, using production:", validTargetUrl);
      }
      
      // 4. إنشاء Ad مباشرة (inline creative - أبسط وأسرع)
      console.log("🎯 Step 4: Creating Ad with inline creative...");
      const adId = await this.createAd({
        name: `${params.campaignName} - Ad`,
        adset_id: adSetId,
        creative: {
          object_story_spec: {
            page_id: this.pageId,
            link_data: {
              link: validTargetUrl, // ✅ استخدام URL صحيح
              message: params.adMessage,
              name: params.adTitle,
              description: params.adDescription,
              picture: validImageUrl, // ✅ استخدام صورة صحيحة
            },
          },
        },
        status: 'ACTIVE',
      });

      return {
        campaignId,
        adSetId,
        adId,
      };
    } catch (error) {
      console.error('Failed to create Facebook campaign:', error);
      throw error;
    }
  }

  /**
   * مزامنة بيانات حملة من Facebook إلى قاعدة البيانات
   */
  async syncCampaignData(campaignId: string) {
    try {
      const insights = await this.getCampaignInsights(campaignId);
      
      if (!insights) {
        return null;
      }

      return {
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        spent: parseFloat(insights.spend || '0'),
        reach: parseInt(insights.reach || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        ctr: parseFloat(insights.ctr || '0'),
        conversions: parseInt(insights.conversions?.[0]?.value || '0'),
      };
    } catch (error) {
      console.error('Failed to sync campaign data:', error);
      return null;
    }
  }
}
