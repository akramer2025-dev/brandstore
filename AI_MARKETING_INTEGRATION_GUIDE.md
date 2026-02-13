# 🚀 دليل ربط نظام التسويق بالمنصات الإعلانية

## 📋 المحتويات
1. [نظام AI Media Buyer](#ai-media-buyer)
2. [ربط منصات الإعلانات](#integration)
3. [تتبع النقرات والمبيعات](#tracking)
4. [عرض النتائج والإحصائيات](#analytics)
5. [إعداد Webhooks](#webhooks)

---

## 🤖 نظام AI Media Buyer

### كيف يشتغل؟

**1. الوصف والتحليل:**
- المستخدم يكتب وصف المنتج/الخدمة
- يختار البلد المستهدف
- يختار نوع/أنواع الحملة

**2. التحليل بالذكاء الاصطناعي:**
```typescript
// API: /api/marketing/ai-assist
- يحلل المنتج/الخدمة
- يبحث عن الكلمات المفتاحية الأنسب
- يحدد الجمهور المستهدف (عمر، جنس، اهتمامات، موقع)
- يكتب نص إعلان احترافي
- يقترح ميزانية واقعية
```

**3. ملء البيانات تلقائياً:**
- كل الحقول تتملى بناءً على تحليل الـ AI
- المستخدم يراجع ويعدل لو محتاج
- يحفظ الحملة

---

## 🔗 ربط منصات الإعلانات (Integration)

### 1. Facebook & Instagram Ads

#### **خطوات الربط:**

**أ. إنشاء Facebook Business Manager:**
1. روح على https://business.facebook.com
2. اعمل Business Manager جديد
3. أضف صفحتك وحساب الإعلانات

**ب. الحصول على Access Token:**
```bash
# روح على Facebook Developers
https://developers.facebook.com/apps/

# اختار تطبيقك أو اعمل واحد جديد
# من Settings > Basic > App Secret
```

**ج. إضافة Pixel:**
```html
<!-- في ملف layout.tsx أو _app.tsx -->
<Script id="facebook-pixel">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
  `}
</Script>
```

**د. إنشاء الحملات عن طريق API:**
```typescript
// src/lib/facebook-ads-service.ts
import { FacebookAdsAPI, Campaign, AdSet, Ad } from 'facebook-nodejs-business-sdk';

const api = FacebookAdsAPI.init(process.env.FACEBOOK_ACCESS_TOKEN!);

export async function createFacebookCampaign(data: {
  name: string;
  objective: string;
  budget: number;
  targetAudience: any;
}) {
  const campaign = new Campaign(null, {
    name: data.name,
    objective: data.objective,
    status: 'PAUSED',
    spending_limit: data.budget * 100, // بالقروش
  });

  await campaign.create();
  
  // إنشاء Ad Set
  const adSet = new AdSet(null, {
    name: `${data.name} - Ad Set`,
    campaign_id: campaign.id,
    daily_budget: (data.budget / 30) * 100,
    targeting: data.targetAudience,
    optimization_goal: 'REACH',
    billing_event: 'IMPRESSIONS',
    bid_amount: 100,
  });

  await adSet.create();

  return { campaignId: campaign.id, adSetId: adSet.id };
}
```

**ه. جلب الإحصائيات:**
```typescript
export async function getFacebookCampaignStats(campaignId: string) {
  const campaign = new Campaign(campaignId);
  const insights = await campaign.getInsights([
    'impressions',
    'clicks',
    'spend',
    'ctr',
    'cpc',
    'conversions',
  ], {
    time_range: { since: '2024-01-01', until: '2024-12-31' }
  });

  return insights[0];
}
```

---

### 2. Google Ads

#### **خطوات الربط:**

**أ. إعداد Google Ads API:**
```bash
# 1. روح على Google Cloud Console
https://console.cloud.google.com/

# 2. اعمل مشروع جديد
# 3. فعّل Google Ads API
# 4. اعمل OAuth 2.0 credentials
```

**ب. تثبيت المكتبة:**
```bash
npm install google-ads-api
```

**ج. الربط:**
```typescript
// src/lib/google-ads-service.ts
import { GoogleAdsApi, Customer } from 'google-ads-api';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

export async function createGoogleAdsCampaign(data: {
  customerId: string;
  name: string;
  budget: number;
}) {
  const customer = client.Customer({
    customer_id: data.customerId,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  });

  const campaign = await customer.campaigns.create({
    name: data.name,
    advertising_channel_type: 'SEARCH',
    status: 'PAUSED',
    campaign_budget: {
      amount_micros: data.budget * 1000000, // بالمايكرو
    },
  });

  return campaign;
}
```

**د. تتبع التحويلات (Google Analytics):**
```html
<!-- في layout.tsx -->
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

---

### 3. TikTok Ads

```typescript
// src/lib/tiktok-ads-service.ts
export async function createTikTokCampaign(data: {
  advertiserId: string;
  name: string;
  budget: number;
}) {
  const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/campaign/create/', {
    method: 'POST',
    headers: {
      'Access-Token': process.env.TIKTOK_ACCESS_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      advertiser_id: data.advertiserId,
      campaign_name: data.name,
      objective_type: 'TRAFFIC',
      budget_mode: 'BUDGET_MODE_DAY',
      budget: data.budget,
    }),
  });

  return await response.json();
}
```

---

## 📊 تتبع النقرات والمبيعات (Tracking System)

### 1. تتبع النقرات على الإعلانات

**أ. إضافة UTM Parameters:**
```typescript
// عند إنشاء الإعلان
const adUrl = `https://yourstore.com/product?utm_source=facebook&utm_medium=cpc&utm_campaign=${campaignId}`;
```

**ب. تسجيل النقرات:**
```typescript
// src/app/api/track/click/route.ts
export async function POST(req: NextRequest) {
  const { campaignId, source, medium } = await req.json();

  // حفظ في قاعدة البيانات
  await prisma.clickEvent.create({
    data: {
      campaignId,
      source,
      medium,
      timestamp: new Date(),
      ipAddress: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
    },
  });

  return NextResponse.json({ success: true });
}
```

---

### 2. تتبع المبيعات والتحويلات

**أ. Facebook Pixel Events:**
```typescript
// في صفحة نجاح الطلب
useEffect(() => {
  // @ts-ignore
  if (typeof window.fbq !== 'undefined') {
    // @ts-ignore
    window.fbq('track', 'Purchase', {
      value: orderTotal,
      currency: 'EGP',
      content_ids: productIds,
      content_type: 'product',
    });
  }
}, []);
```

**ب. Google Analytics Events:**
```typescript
// في صفحة نجاح الطلب
useEffect(() => {
  // @ts-ignore
  if (typeof window.gtag !== 'undefined') {
    // @ts-ignore
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: orderTotal,
      currency: 'EGP',
      items: products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
    });
  }
}, []);
```

**ج. حفظ في قاعدة البيانات:**
```typescript
// src/app/api/track/conversion/route.ts
export async function POST(req: NextRequest) {
  const { orderId, campaignId, value } = await req.json();

  await prisma.conversionEvent.create({
    data: {
      orderId,
      campaignId,
      value,
      timestamp: new Date(),
    },
  });

  // تحديث إحصائيات الحملة
  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: {
      conversions: { increment: 1 },
      roi: {
        // حساب ROI جديد
        increment: ((value - cost) / cost) * 100,
      },
    },
  });

  return NextResponse.json({ success: true });
}
```

---

## 📈 عرض النتائج والإحصائيات (Analytics Dashboard)

### 1. جلب البيانات من المنصات

**Cron Job لتحديث الإحصائيات كل ساعة:**
```typescript
// src/app/api/cron/update-campaigns/route.ts
export async function GET() {
  const campaigns = await prisma.marketingCampaign.findMany();

  for (const campaign of campaigns) {
    let stats;

    // جلب الإحصائيات من المنصة المناسبة
    if (campaign.platform?.includes('Facebook')) {
      stats = await getFacebookCampaignStats(campaign.id);
    } else if (campaign.platform?.includes('Google')) {
      stats = await getGoogleAdsCampaignStats(campaign.id);
    }

    // تحديث في قاعدة البيانات
    if (stats) {
      await prisma.marketingCampaign.update({
        where: { id: campaign.id },
        data: {
          impressions: stats.impressions,
          clicks: stats.clicks,
          spent: stats.spend,
          ctr: (stats.clicks / stats.impressions) * 100,
          cpc: stats.spend / stats.clicks,
          conversions: stats.conversions || 0,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
```

**إعداد Vercel Cron:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/update-campaigns",
    "schedule": "0 * * * *"
  }]
}
```

---

### 2. عرض البيانات في Dashboard

```typescript
// في صفحة التسويق
const campaigns = await prisma.marketingCampaign.findMany({
  orderBy: { createdAt: 'desc' },
});

// البيانات تظهر في:
// 1. الإحصائيات العامة (حملات نشطة، ميزانية، نقرات، تحويلات)
// 2. الرسم البياني (الأداء مع الوقت)
// 3. أفضل الحملات أداءً (ROI أعلى)
// 4. الحملات التي تحتاج تحسين (ROI منخفض)
```

---

## 🔔 Webhooks للتحديثات الفورية

### 1. Facebook Webhooks

**أ. إعداد Webhook Endpoint:**
```typescript
// src/app/api/webhooks/facebook/route.ts
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // معالجة الأحداث
  if (body.entry) {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'ads_insights') {
          // تحديث الإحصائيات فوراً
          await updateCampaignStats(change.value);
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
```

**ب. تسجيل Webhook في Facebook:**
```bash
# في Facebook App Settings > Webhooks
Callback URL: https://yoursite.com/api/webhooks/facebook
Verify Token: YOUR_VERIFY_TOKEN
Fields: ads_insights, campaign_insights
```

---

### 2. Google Ads Webhooks (Push Notifications)

```typescript
// src/app/api/webhooks/google-ads/route.ts
export async function POST(req: NextRequest) {
  const notification = await req.json();

  // معالجة إشعارات Google Ads
  if (notification.resource_name) {
    const campaignId = extractCampaignId(notification.resource_name);
    await syncGoogleAdsCampaign(campaignId);
  }

  return NextResponse.json({ success: true });
}
```

---

## ✅ قائمة المهام الكاملة

### المرحلة 1: الإعداد الأساسي ✅
- [x] إنشاء نموذج الحملة مع AI Assistant
- [x] إضافة حقل `types` لدعم أنواع متعددة
- [x] API endpoint للـ AI Assistant
- [ ] إضافة Facebook Pixel
- [ ] إضافة Google Analytics
- [ ] إضافة TikTok Pixel

### المرحلة 2: ربط المنصات
- [ ] ربط Facebook Ads API
- [ ] ربط Google Ads API
- [ ] ربط TikTok Ads API
- [ ] ربط Snapchat Ads API

### المرحلة 3: نظام التتبع
- [ ] تتبع النقرات (UTM Parameters)
- [ ] تتبع التحويلات (Pixel Events)
- [ ] حفظ البيانات في قاعدة البيانات
- [ ] حساب ROI تلقائياً

### المرحلة 4: التحديثات الفورية
- [ ] Cron Job لتحديث الإحصائيات كل ساعة
- [ ] Facebook Webhooks
- [ ] Google Ads Push Notifications
- [ ] TikTok Webhooks

### المرحلة 5: Dashboard المتقدم
- [ ] رسوم بيانية تفصيلية
- [ ] تقارير مخصصة
- [ ] مقارنة بين الحملات
- [ ] تنبيهات تلقائية

---

## 📞 الدعم والمساعدة

- **Facebook Business Help:** https://business.facebook.com/help
- **Google Ads API Docs:** https://developers.google.com/google-ads/api/docs
- **TikTok Business:** https://ads.tiktok.com/help

---

## 🎯 الخلاصة

النظام دلوقتي فيه:

1. ✅ **AI Media Buyer:** بيحلل المنتج ويملا البيانات تلقائياً
2. ⏳ **Platform Integration:** محتاج تربط APIs المنصات
3. ⏳ **Tracking System:** محتاج تضيف Pixels والـ Event Tracking
4. ⏳ **Webhooks:** محتاج تعمل endpoints للتحديثات الفورية
5. ✅ **Dashboard:** موجود بالفعل وبيعرض البيانات

**الخطوات القادمة:**
1. أضف OPENAI_API_KEY في `.env`
2. ربط Facebook Business Manager
3. ربط Google Ads Account
4. إضافة Tracking Pixels
5. اختبار النظام الكامل

🚀 **النظام جاهز للاستخدام الأساسي، والـ Integrations المتقدمة محتاجة إعداد خارجي!**
