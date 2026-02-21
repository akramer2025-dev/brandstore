# 🔑 تجديد Facebook Access Token - خطوات سريعة

## ⚠️ المشكلة الحالية:
```
Access Token انتهت صلاحيته في 14-Feb-2026
```

---

## ✅ الحل السريع (3 دقائق):

### **الطريقة 1: Graph API Explorer (سهلة)**

1. **افتح**: https://developers.facebook.com/tools/explorer/

2. **اختر تطبيقك** من القائمة العلوية

3. **اضغط "Generate Access Token"** → "Get User Access Token"

4. **اختر الصلاحيات المطلوبة:**
   ```
   ✅ ads_management
   ✅ ads_read  
   ✅ business_management
   ✅ pages_read_engagement
   ✅ pages_manage_posts
   ✅ pages_show_list
   ✅ catalog_management
   ```

5. **اضغط "Generate Access Token"**

6. **انسخ الـ Token** (يبدأ بـ `EAA...`)

7. **حدث في ملف `.env`:**
   ```bash
   FACEBOOK_ACCESS_TOKEN=EAAكود_طويل_جدا_هنا
   ```

8. **احفظ الملف وأعد تشغيل السيرفر:**
   ```bash
   npm run dev
   ```

---

## ⏰ الطريقة 2: Long-Lived Token (يدوم 60 يوم)

### **الخطوة 1: احصل على Short-Lived Token**
من Graph API Explorer كما في الطريقة 1

### **الخطوة 2: حوّله لـ Long-Lived**
```bash
# في PowerShell:
$SHORT_TOKEN = "EAA..." # ضع الـ token من الخطوة 1
$APP_ID = "your_app_id"
$APP_SECRET = "your_app_secret"

$url = "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$APP_ID&client_secret=$APP_SECRET&fb_exchange_token=$SHORT_TOKEN"

Invoke-RestMethod -Uri $url
```

سيعطيك Token جديد يدوم **60 يوم**.

---

## 🔄 الطريقة 3: System User Token (الأفضل - لا ينتهي!)

### **1. افتح Business Manager:**
https://business.facebook.com/settings/system-users

### **2. أنشئ System User:**
- اضغط "Add"
- الاسم: "Store Bot"
- الدور: Admin

### **3. اعطيه صلاحيات:**
- Ad Account: Full Control
- Pages: Full Control  
- Catalog: Full Control

### **4. احصل على Token:**
- اضغط "Generate New Token"
- اختر Permissions:
  - ads_management
  - ads_read
  - business_management
  - catalog_management
- المدة: **Never Expire**

### **5. حدث `.env`:**
```bash
FACEBOOK_ACCESS_TOKEN=<الـ token الجديد>
```

هذا الـ Token **لن ينتهي أبداً!** ✅

---

## 🧪 تأكد من نجاح التجديد:

```bash
# اختبر الـ Token الجديد:
npx tsx test-facebook-api.ts

# زامن الحملات من Facebook:
npx tsx sync-facebook-campaigns.ts

# تحقق من حالة الحملات:
npx tsx check-facebook-campaigns-status.ts
```

---

## 📊 بعد التجديد:

### **1. زامن الحملات من Meta:**
```bash
npx tsx sync-facebook-campaigns.ts
```
سيستورد جميع حملاتك من Facebook Ads Manager إلى قاعدة البيانات.

### **2. اعرض الحملات في النظام:**
افتح: http://localhost:3000/admin/media-buyer

---

## ⚡ Troubleshooting:

### **إذا قال "Token Invalid":**
- تأكد أنك اخترت التطبيق الصحيح
- تأكد من اختيار جميع الصلاحيات
- جرب تسجيل الدخول بحساب Admin

### **إذا قال "Insufficient Permissions":**
- تحتاج تكون Admin على Ad Account
- تحتاج تكون Admin على Facebook Page
- راجع Business Manager Settings

### **إذا قال "App Not Configured":**
- تأكد من إضافة `FACEBOOK_APP_ID` و `FACEBOOK_APP_SECRET` في `.env`
- تأكد من تفعيل Facebook Login في التطبيق

---

## 🎯 الخلاصة:

**الأسرع (يدوم أسبوعين):**  
Graph API Explorer → Generate Token → نسخ في `.env`

**الأفضل (يدوم 60 يوم):**  
Short Token → تحويل لـ Long-Lived → نسخ في `.env`

**الأمثل (لا ينتهي!):**  
System User → Generate Token (Never Expire) → نسخ في `.env`

---

## 📞 هل تحتاج مساعدة؟

إذا واجهت مشكلة:
1. شغّل `npx tsx test-facebook-api.ts` وأرسل النتيجة
2. تأكد من `.env` file يحتوي على:
   ```
   FACEBOOK_ACCESS_TOKEN=...
   FACEBOOK_AD_ACCOUNT=act_...
   FACEBOOK_PAGE_ID=...
   FACEBOOK_APP_ID=...
   FACEBOOK_APP_SECRET=...
   ```
