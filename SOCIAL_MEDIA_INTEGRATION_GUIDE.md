# 🔗 دليل ربط السوشيال ميديا - Facebook & Instagram

## 📋 نظرة عامة

هذا الدليل يشرح كيفية ربط صفحات **Facebook** و**Instagram Business** مع تطبيقك لنشر المحتوى وتتبع الإحصائيات.

---

## 🎯 الخطوات الرئيسية

### **1️⃣ إنشاء Facebook App**
### **2️⃣ الحصول على Access Token**
### **3️⃣ ربط الحساب في التطبيق**
### **4️⃣ نشر المحتوى**

---

## 🚀 الخطوة 1: إنشاء Facebook App

### 1. انتقل إلى Facebook Developers
🔗 [https://developers.facebook.com](https://developers.facebook.com)

### 2. أنشئ تطبيق جديد
- اضغط على **"My Apps"** → **"Create App"**
- اختر **"Business"** أو **"Consumer"**
- املأ التفاصيل:
  - **App Name**: اسم تطبيقك (مثال: My E-Commerce Store)
  - **Contact Email**: بريدك الإلكتروني
  - **Business Account**: (اختياري)

### 3. إضافة Products
في صفحة التطبيق، أضف:
- ✅ **Facebook Login**
- ✅ **Instagram Basic Display**
- ✅ **Instagram Graph API**

---

## 🔑 الخطوة 2: الحصول على Access Token

### طريقة سريعة (للتطوير والاختبار):

#### **استخدام Graph API Explorer**

1. انتقل إلى:
   🔗 [https://developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)

2. في الأعلى، اختر تطبيقك من القائمة

3. اضغط على **"Generate Access Token"**

4. حدد الأذونات التالية:
   - ✅ `pages_manage_posts` - نشر محتوى على الصفحات
   - ✅ `pages_read_engagement` - قراءة الإحصائيات
   - ✅ `pages_show_list` - عرض قائمة الصفحات
   - ✅ `instagram_basic` - الوصول لحساب Instagram
   - ✅ `instagram_content_publish` - نشر على Instagram
   - ✅ `instagram_manage_insights` - قراءة إحصائيات Instagram

5. انسخ الـ **User Access Token**

6. **⚠️ هام:** هذا Token قصير الأمد (ساعتين). للحصول على Token طويل الأمد:

   ```bash
   curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id=YOUR_APP_ID&
     client_secret=YOUR_APP_SECRET&
     fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

   سيعطيك Token يعمل لمدة **60 يوم**.

---

### طريقة متقدمة (للإنتاج):

#### **استخدام OAuth Flow**

1. أضف **Facebook Login** في تطبيقك

2. في **Facebook Login Settings**:
   - **Valid OAuth Redirect URIs**: أضف:
     ```
     https://yourdomain.com/api/auth/callback/facebook
     ```

3. استخدم OAuth flow لتوجيه المستخدم:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?
     client_id=YOUR_APP_ID&
     redirect_uri=YOUR_REDIRECT_URI&
     scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish
   ```

4. سيتم استلام `code` في الـ callback، استبدله بـ Token:
   ```bash
   curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?
     client_id=YOUR_APP_ID&
     redirect_uri=YOUR_REDIRECT_URI&
     client_secret=YOUR_APP_SECRET&
     code=RECEIVED_CODE"
   ```

---

## 🔗 الخطوة 3: ربط الحساب في التطبيق

### في Admin Panel:

1. انتقل إلى: **`/admin/social-media`**

2. اختر **"الحسابات"**

3. املأ النموذج:
   - **المنصة**: Facebook أو Instagram
   - **Access Token**: الصق الـ Token الذي حصلت عليه

4. اضغط **"ربط الحساب"**

### ما يحدث خلف الكواليس:
- ✅ يتحقق من صلاحية الـ Token
- ✅ يجلب قائمة الصفحات المرتبطة بحسابك
- ✅ يختار أول صفحة (أو يمكن تحسينه للاختيار اليدوي)
- ✅ يحفظ معلومات الحساب في قاعدة البيانات

---

## 📝 الخطوة 4: نشر المحتوى

### نشر مباشر:

1. انتقل إلى تبويب **"نشر منشور"**

2. املأ:
   - **الحساب**: اختر الحساب المربوط
   - **المحتوى**: اكتب محتوى المنشور
   - **رابط الصورة**: (اختياري) ضع رابط صورة عامة
   - **الجدولة**: (اختياري) اترك فارغاً للنشر الفوري

3. اضغط **"نشر الآن"**

### جدولة منشور:

1. نفس الخطوات السابقة

2. في حقل **"جدولة المنشور"**: اختر التاريخ والوقت المستقبلي

3. سيتم حفظ المنشور بحالة **SCHEDULED** ولن ينشر فوراً

   > **ملاحظة:** حالياً الجدولة تحفظ فقط في قاعدة البيانات. يمكن تحسينها بإضافة Cron Job أو Background Worker لنشر المحتوى المجدول تلقائياً.

---

## 📊 تتبع الإحصائيات

### تحديث إحصائيات منشور:

1. في تبويب **"المنشورات"**

2. اضغط على **"تحديث الإحصائيات"** أسفل أي منشور منشور

3. سيتم جلب:
   - ❤️ عدد الإعجابات
   - 💬 عدد التعليقات
   - 🔄 عدد المشاركات
   - 👁️ الوصول (Reach)

---

## ⚙️ متغيرات البيئة

أضف في ملف `.env`:

```env
# Facebook App Credentials
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# (اختياري) لـ OAuth Flow
NEXTAUTH_URL=https://yourdomain.com
```

**كيفية الحصول عليها:**
- اذهب إلى تطبيقك في Facebook Developers
- اختر **Settings → Basic**
- انسخ **App ID** و **App Secret**

---

## 🌐 API Endpoints

### 1. ربط حساب
```bash
POST /api/social-media/connect
Content-Type: application/json

{
  "platform": "FACEBOOK",  # أو INSTAGRAM
  "accessToken": "YOUR_ACCESS_TOKEN"
}
```

### 2. نشر منشور
```bash
POST /api/social-media/post
Content-Type: application/json

{
  "accountId": "account_id",
  "content": "محتوى المنشور",
  "imageUrl": "https://example.com/image.jpg",  # اختياري
  "scheduledFor": "2024-12-25T10:00:00Z"       # اختياري
}
```

### 3. تحديث إحصائيات
```bash
POST /api/social-media/metrics
Content-Type: application/json

{
  "postId": "post_id"
}
```

### 4. جلب الحسابات
```bash
GET /api/social-media/connect
```

### 5. جلب المنشورات
```bash
GET /api/social-media/post?accountId=xxx&status=PUBLISHED
```

---

## 🔐 الأذونات المطلوبة

### لـ Facebook:
- ✅ `pages_manage_posts` - نشر محتوى
- ✅ `pages_read_engagement` - قراءة الإحصائيات
- ✅ `pages_show_list` - عرض الصفحات

### لـ Instagram:
- ✅ `instagram_basic` - معلومات الحساب
- ✅ `instagram_content_publish` - نشر محتوى
- ✅ `instagram_manage_insights` - قراءة الإحصائيات

---

## ⚠️ ملاحظات هامة

### 1. Instagram Business Account
- ❌ لا يمكن النشر على حساب Instagram شخصي
- ✅ يجب أن يكون **Instagram Business Account**
- 🔗 يجب ربطه بصفحة Facebook

**كيفية التحويل:**
1. في تطبيق Instagram
2. Settings → Account → Switch to Professional Account
3. اختر Business
4. اربطه بصفحة Facebook

### 2. صلاحية Token
- **Short-lived Token**: ساعتين
- **Long-lived Token**: 60 يوم
- **Page Token**: غير محدود (طالما الـ User Token صالح)

> **نصيحة:** استخدم Page Token للصفحات لأنه أطول عمراً.

### 3. حدود API

#### Facebook:
- **200 منشور / ساعة** لكل صفحة
- **4800 منشور / يوم** لكل صفحة

#### Instagram:
- **25 منشور / يوم** لكل حساب
- **5 منشورات / ساعة**

### 4. متطلبات الصور

#### Facebook:
- ✅ يدعم: JPG, PNG, GIF
- ✅ الحد الأقصى: 8 MB
- ✅ الأبعاد المثالية: 1200x630 px

#### Instagram:
- ✅ يدعم: JPG, PNG
- ✅ الحد الأقصى: 8 MB
- ✅ الأبعاد المثالية: 1080x1080 px (مربع) أو 1080x1350 px (عمودي)
- ⚠️ **يجب** أن تكون الصورة accessible publicly

---

## 🐛 حل المشاكل الشائعة

### 1. Error: "The session has expired"
- ✅ الـ Access Token انتهت صلاحيته
- **الحل:** احصل على Token جديد وحدث الحساب

### 2. Error: "Permissions error"
- ✅ تطبيق Facebook يفتقد للأذونات
- **الحل:** تأكد من طلب جميع الـ permissions المطلوبة

### 3. Error: "Invalid OAuth access token"
- ✅ الـ Token غير صحيح أو منتهي
- **الحل:** احصل على Token جديد

### 4. Instagram: "No Instagram Business Account found"
- ✅ الحساب ليس Business Account
- ✅ غير مربوط بصفحة Facebook
- **الحل:** حول الحساب وربطه بصفحة

### 5. Error: "Image could not be downloaded"
- ✅ رابط الصورة غير صالح
- ✅ الصورة محمية (private)
- **الحل:** استخدم رابط صورة public (مثل Cloudinary)

---

## 🔮 تحسينات مستقبلية

### 1. جدولة ذكية
- إضافة Cron Job لنشر المحتوى المجدول  تلقائياً
- استخدام Vercel Cron أو AWS Lambda

### 2. تحليلات متقدمة
- رسوم بيانية للإحصائيات
- مقارنة أداء المنشورات
- أفضل أوقات النشر

### 3. محرر محتوى
- Upload صور مباشرة
- معاينة المنشور قبل النشر
- تحديد منتج من المتجر

### 4. Multi-image posts
- دعم Albums على Facebook
- Carousels على Instagram

### 5. Stories
- نشر Instagram Stories
- Facebook Stories

---

## 📚 مصادر إضافية

- 📘 [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- 📷 [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- 🔐 [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login)
- 🛠️ [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- 🔍 [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من صلاحية الـ Access Token في [Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)
2. راجع Console Logs في المتصفح
3. تحقق من Server Logs

---

✅ **تم! الآن يمكنك ربط صفحاتك والبدء في النشر** 🚀
