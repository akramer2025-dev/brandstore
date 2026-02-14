# 🚀 نظام إنشاء الحملات الإعلانية التلقائي

## ✨ الميزة الجديدة

**أصبح بإمكانك الآن إنشاء حملات Facebook Ads مباشرة من التطبيق بضغطة زر واحدة!**

لا حاجة للدخول إلى Facebook Ads Manager أو نسخ ولصق الإعدادات يدوياً. فقط املأ البيانات في التطبيق واضغط "إنشاء"! 🎯

---

## 📋 جدول المحتويات

1. [الميزات الرئيسية](#الميزات-الرئيسية)
2. [المتطلبات](#المتطلبات)
3. [خطوات الإعداد](#خطوات-الإعداد)
4. [كيفية الاستخدام](#كيفية-الاستخدام)
5. [البنية التقنية](#البنية-التقنية)
6. [حل المشاكل](#حل-المشاكل)

---

## 🎁 الميزات الرئيسية

### ✅ **إنشاء تلقائي للحملات**
- إنشاء Campaign + AdSet + Ad في خطوة واحدة
- لا حاجة لفتح Facebook Ads Manager
- حفظ الحملة في قاعدة البيانات تلقائياً

### ✅ **واجهة بسيطة وسهلة**
- قوالب نصوص جاهزة للإعلانات
- اختيار الميزانية بضغطة زر
- توصيات للجمهور المستهدف

### ✅ **إدارة متكاملة**
- متابعة أداء الحملات من التطبيق
- ربط مباشر مع Facebook Ads Manager
- تتبع Campaign ID, AdSet ID, Ad ID

### ✅ **صفحة إعدادات مخصصة**
- إدخال Access Token بشكل آمن
- حفظ في ملف .env
- اختبار الاتصال قبل الإنشاء

---

## ⚙️ المتطلبات

### **1. Facebook Business Manager**
- حساب Facebook Business Manager نشط
- Facebook Page مرتبطة
- Ad Account مع صلاحيات Admin

### **2. Facebook Access Token**
يجب الحصول على Long-lived User Access Token مع Permissions:
- `ads_management` (إدارة الإعلانات)
- `ads_read` (قراءة بيانات الإعلانات)
- `pages_show_list` (عرض الصفحات)
- `pages_read_engagement` (قراءة تفاعل الصفحات)
- `business_management` (إدارة البيزنس)
- `read_insights` (قراءة الإحصائيات)

### **3. معلومات الحساب**
- **Ad Account ID**: يبدأ بـ `act_` (مثال: `act_1234567890`)
- **Page ID**: رقم الصفحة (15 رقم)

---

## 🚀 خطوات الإعداد

### **الخطوة 1: الحصول على Access Token**

#### **أ) استخدام Graph API Explorer (موصى به)**

1. افتح: https://developers.facebook.com/tools/explorer/
2. اختر التطبيق: **brandstore** (أو اسم تطبيقك)
3. اضغط "Generate Access Token"
4. اختر **Permissions** المطلوبة (انظر القائمة أعلاه)
5. انسخ الـ Token (يبدأ بـ `EAAWc2Eqq7AO...`)

⚠️ **هذا short-lived token (ساعة واحدة فقط)**

#### **ب) تحويل إلى Long-lived Token (60 يوم)**

استخدم PowerShell Script الجاهز:

```powershell
cd d:\markting
.\refresh-facebook-token.ps1 -ShortToken "EAAWc2Eqq7AO..."
```

أو يدوياً:

```
https://graph.facebook.com/v21.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=YOUR_APP_ID&
  client_secret=YOUR_APP_SECRET&
  fb_exchange_token=SHORT_LIVED_TOKEN
```

---

### **الخطوة 2: إعداد التطبيق**

#### **أ) إدخال الإعدادات من الواجهة**

1. افتح التطبيق: http://localhost:3000/admin
2. اضغط على **"🔧 إعدادات Facebook API"**
3. أدخل البيانات:
   - **Access Token**: Long-lived Token (من الخطوة 1)
   - **Ad Account ID**: `act_1234567890`
   - **Page ID**: `123456789012345`
4. اضغط **"حفظ الإعدادات"**
5. اضغط **"اختبار الاتصال"** للتأكد

✅ **سيتم حفظ البيانات في `.env` تلقائياً**

#### **ب) أو التعديل اليدوي في `.env`**

```env
FACEBOOK_ACCESS_TOKEN="EAAWc2Eqq7AOBOzy..."
FACEBOOK_AD_ACCOUNT_ID="act_1234567890"
FACEBOOK_PAGE_ID="123456789012345"
```

---

### **الخطوة 3: التأكد من العمل**

1. افتح: `/admin/facebook-settings`
2. اضغط "اختبار الاتصال"
3. يجب أن تظهر رسالة: ✅ **"الاتصال ناجح!"**

---

## 💡 كيفية الاستخدام

### **1. الدخول إلى Media Buyer**

```
/admin/media-buyer → تبويب "⚡ إنشاء تلقائي"
```

### **2. إنشاء حملة جديدة**

#### **أ) الإعدادات الأساسية**

- **اسم الحملة**: مثل "حملة الشتاء 2026"
- **هدف الحملة**: 
  - 🚀 زيارات (Traffic) - لجلب زوار
  - 🛒 مبيعات (Sales) - لزيادة الشراء
  - 📢 وعي (Awareness) - لنشر العلامة
  - 💬 تفاعل (Engagement) - للتفاعل

#### **ب) الميزانية**

اختر من:
- **50 ج/يوم** - مبتدئ (5,000-10,000 وصول)
- **100 ج/يوم** - قياسي (10,000-20,000 وصول)
- **200 ج/يوم** - متقدم (20,000-40,000 وصول)
- **500 ج/يوم** - مكثف (50,000-100,000 وصول)

أو أدخل مبلغ مخصص.

#### **ج) محتوى الإعلان**

يمكنك:
1. **اختيار قالب جاهز** (3 قوالب متاحة)
2. **أو الكتابة يدوياً**:
   - **العنوان**: 🔥 تخفيضات لفترة محدودة!
   - **النص الأساسي**: خصم يصل لـ 50٪... (125-150 حرف)
   - **الوصف** (اختياري): جودة عالية • أسعار مناسبة

#### **د) الروابط والصور**

- **رابط الصفحة المستهدفة**: `https://www.remostore.net`
- **رابط الصورة** (اختياري): `https://example.com/image.jpg`

إذا تركت الصورة فارغة، سيتم استخدام صورة افتراضية من Unsplash.

### **3. إطلاق الحملة**

اضغط "🚀 إنشاء الحملة الآن على Facebook"

**ماذا يحدث؟**
1. ✅ إنشاء Campaign على Facebook
2. ✅ إنشاء AdSet مع الميزانية المحددة
3. ✅ إنشاء Ad مع المحتوى
4. ✅ حفظ بيانات الحملة في قاعدة البيانات
5. ✅ ربط Campaign ID مع السجل المحلي

### **4. متابعة الحملة**

بعد الإنشاء الناجح، ستحصل على:

```
✅ Campaign ID: 120210883956480122
✅ AdSet ID: 120210883956550123
✅ Ad ID: 120210883956620124
```

يمكنك:
- فتح [Facebook Ads Manager](https://facebook.com/adsmanager)
- متابعة من `/admin/campaign-manager?id=...`

---

## 🏗️ البنية التقنية

### **الملفات الرئيسية**

```
src/
├── app/
│   ├── admin/
│   │   ├── media-buyer/
│   │   │   ├── CampaignWizard.tsx      # المكون الرئيسي
│   │   │   └── AutoCampaignCreator.tsx # مكون الإنشاء التلقائي
│   │   └── facebook-settings/
│   │       └── page.tsx                # صفحة الإعدادات
│   └── api/
│       ├── marketing/
│       │   └── facebook/
│       │       └── create/
│       │           └── route.ts        # API إنشاء الحملة
│       └── settings/
│           └── facebook/
│               └── route.ts            # API الإعدادات
├── lib/
│   └── facebook-marketing.ts           # خدمة Facebook API
```

### **Flow الكامل**

```
1. User Input (AutoCampaignCreator.tsx)
   ↓
2. POST /api/marketing/campaigns (حفظ في DB)
   ↓
3. POST /api/marketing/facebook/create
   ↓
4. FacebookMarketing.createFullCampaign()
   ├── createCampaign()    → Facebook Campaign
   ├── createAdSet()       → Facebook AdSet
   └── createAd()          → Facebook Ad
   ↓
5. Update DB with Facebook IDs
   ↓
6. Return Success + IDs
```

### **Facebook Marketing Service**

```typescript
// src/lib/facebook-marketing.ts
class FacebookMarketing {
  async createFullCampaign(params) {
    const campaignId = await this.createCampaign({
      name, objective, status: 'ACTIVE'
    });
    
    const adSetId = await this.createAdSet({
      campaign_id: campaignId,
      daily_budget: budget * 100,
      targeting: { geo_locations, age_min, age_max }
    });
    
    const adId = await this.createAd({
      adset_id: adSetId,
      creative: { object_story_spec }
    });
    
    return { campaignId, adSetId, adId };
  }
}
```

### **API Endpoints**

#### **POST /api/marketing/facebook/create**

**Request:**
```json
{
  "campaignId": "uuid",
  "targetUrl": "https://www.remostore.net",
  "adMessage": "...",
  "adTitle": "...",
  "adDescription": "...",
  "imageUrl": "..."
}
```

**Response:**
```json
{
  "success": true,
  "facebook": {
    "campaignId": "120210883956480122",
    "adSetId": "120210883956550123",
    "adId": "120210883956620124"
  },
  "campaign": { /* DB record */ }
}
```

#### **POST /api/settings/facebook**

**Request:**
```json
{
  "accessToken": "EAAWc2Eqq7AO...",
  "adAccountId": "act_1234567890",
  "pageId": "123456789012345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings saved successfully"
}
```

---

## 🐛 حل المشاكل

### **❌ Error: "Failed to create campaign"**

**الأسباب المحتملة:**
1. Access Token منتهي أو غير صحيح
2. Ad Account ID خطأ (يجب أن يبدأ بـ `act_`)
3. Page ID غير صحيح
4. صلاحيات (Permissions) غير كافية

**الحل:**
1. جدد Access Token من Graph API Explorer
2. تأكد من Ad Account ID (من Ads Manager → Settings)
3. تحقق من Permissions (يجب أن تشمل `ads_management`)

---

### **❌ Error: "Invalid OAuth access token"**

**السبب:** Token منتهي الصلاحية

**الحل:**
```powershell
.\refresh-facebook-token.ps1 -ShortToken "NEW_TOKEN"
```

ثم حدّث في: `/admin/facebook-settings`

---

### **❌ Error: "The budget you entered is below the minimum"**

**السبب:** Facebook يتطلب حد أدنى للميزانية (عادة 50 ج/يوم)

**الحل:** زد الميزانية لـ 50 ج على الأقل

---

### **❌ Error: "localhost URL not allowed"**

**السبب:** Facebook لا يقبل روابط localhost في الإعلانات

**الحل:** النظام يستخدم تلقائياً `PRODUCTION_URL` من `.env` أو `https://www.remostore.net`

---

### **❌ Campaign created but not showing in Ads Manager**

**السبب:** قد يستغرق بضع دقائق للظهور

**الحل:**
1. انتظر 2-3 دقائق وحدّث الصفحة
2. تحقق من Campaign ID في Database
3. ابحث عن Campaign ID مباشرة في Ads Manager

---

## 📊 إحصائيات الأداء

لمتابعة أداء الحملات:

1. **من التطبيق:**
   - `/admin/campaign-manager` - متابعة جميع الحملات
   - `/admin/marketing` - تحليلات شاملة

2. **من Facebook:**
   - [Ads Manager](https://facebook.com/adsmanager) - بيانات حية
   - [Business Manager](https://business.facebook.com) - تقارير مفصلة

3. **Sync من Facebook:**
   ```typescript
   POST /api/marketing/facebook/sync
   { "campaignId": "uuid" }
   ```

---

## 🔒 الأمان

### **حماية Access Token**
- ✅ يتم حفظ Token في `.env` (غير متاح للمستخدمين)
- ✅ لا يتم عرض Token كامل في الواجهة
- ✅ صفحة الإعدادات محمية (ADMIN فقط)
- ✅ API endpoints محمية بـ Authentication

### **Best Practices**
- 🔄 جدد Token كل 50 يوم (قبل انتهاء الصلاحية)
- 🔐 لا تشارك Token مع أحد
- 📝 استخدم System User Token للاستقرار
- ⚠️ راقب استخدام API Limits

---

## 📚 موارد إضافية

### **دلائل مفصلة:**
- [FACEBOOK_TOKEN_GUIDE.md](./FACEBOOK_TOKEN_GUIDE.md) - دليل Access Token الشامل
- [PRODUCT_CATALOG_GUIDE.md](./PRODUCT_CATALOG_GUIDE.md) - ربط كتالوج المنتجات

### **روابط Facebook:**
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Ads Manager](https://facebook.com/adsmanager)
- [Business Settings](https://business.facebook.com/settings/)
- [Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)

### **أدوات مساعدة:**
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)

---

## ✨ التطويرات المستقبلية

- [ ] جدولة الحملات (Schedule)
- [ ] A/B Testing تلقائي
- [ ] توصيات ذكية بالذكاء الاصطناعي (AI)
- [ ] Dynamic Product Ads
- [ ] Retargeting Campaigns
- [ ] Auto-pause low performers
- [ ] Budget optimization

---

## 📞 الدعم

إذا واجهت مشكلة:

1. **تحقق من**: [حل المشاكل](#-حل-المشاكل)
2. **راجع**: Console logs في Developer Tools
3. **تأكد من**: صحة credentials في `/admin/facebook-settings`
4. **اختبر**: `/api/facebook/test-connection`

---

**🎉 الآن أنت جاهز لإنشاء حملاتك الإعلانية بضغطة زر واحدة!**

