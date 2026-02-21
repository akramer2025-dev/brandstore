# 🔧 حل مشكلة Facebook Balance API

## ❌ المشكلة:
الخطأ 400 عند محاولة جلب رصيد Facebook Ads:
```
Failed to load resource: the server responded with a status of 400
Error: فشل في جلب بيانات الحساب من Facebook
```

---

## 🔍 السبب المحتمل:

### 1️⃣ **Access Token منتهي أو غير موجود**
- Access Token صلاحيته محدودة (60 يوم عادة)
- قد يكون غير مضاف في Vercel Environment Variables

### 2️⃣ **Ad Account ID غير صحيح**
- قد ي كون مكتوب بدون `act_` في البداية
- أو Account ID خطأ

### 3️⃣ **صلاحيات Token غير كافية**
- Token يحتاج صلاحيات: `ads_management`, `ads_read`, `business_management`

---

## ✅ الحل:

### خطوة 1: تجديد Access Token

1. **افتح Facebook Graph API Explorer:**
   ```
   https://developers.facebook.com/tools/explorer/
   ```

2. **اختر التطبيق:**
   - Meta App ID: **اختر تطبيقك**

3. **اختار الصلاحيات:**
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_show_list`
   - `pages_read_engagement`

4. **اضغط "Generate Access Token"**

5. **انسخ الـ Token** (يبدأ بـ `EAAW...`)

---

### خطوة 2: تحديث Environment Variables في Vercel

1. **افتح Vercel Dashboard:**
   ```
   https://vercel.com/akramer2025-dev/brandstore/settings/environment-variables
   ```

2. **حدّث المتغيرات التالية:**

   | المتغير | القيمة | مثال |
   |---------|-------|------|
   | `FACEBOOK_ACCESS_TOKEN` | الـ Token الجديد | `EAAWc2Eqq7AoBQ...` |
   | `FACEBOOK_AD_ACCOUNT_ID` | Ad Account ID | `act_1962278932225` |
   | `FACEBOOK_PAGE_ID` | Page ID | `103042954595602` |

3. **احفظ التغييرات**

4. **أعد Deploy:**
   ```bash
   # من VS Code Terminal:
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push origin main
   ```

---

### خطوة 3: تأكد من Ad Account ID

1. **افتح Facebook Ads Manager:**
   ```
   https://business.facebook.com/adsmanager
   ```

2. **شوف الـ URL:**
   ```
   https://business.facebook.com/adsmanager/manage/campaigns?act=1962278932225
                                                             ^^^^^^^^^^^^^^^^
   ```

3. **Ad Account ID:**
   - الرقم بعد `act=` في الـ URL
   - أضف `act_` قبله في Environment Variables
   - مثال: `act_1962278932225`

---

## 🧪 اختبار الحل:

بعد Deploy الجديد:

1. **افتح Media Buyer:**
   ```
   https://www.remostore.net/admin/media-buyer
   ```

2. **هتظهر رسالة خطأ مفصلة** تشمل:
   - السبب الدقيق
   - Facebook Error Code
   - FB Trace ID
   - اقتراحات للحل

3. **إذا الـ Token صالح:**
   - هتظهر بطاقة الرصيد خضراء ✅
   - هتشوف الرصيد المتاح
   - إجمالي الإنفاق
   - حالة الحساب

---

## 📊 الخطأ الشائع:

### ❌ Access Token Expired:
```json
{
  "error": {
    "message": "Error validating access token: Session has expired...",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 463
  }
}
```

**الحل:** جدد الـ Token من Graph API Explorer (الخطوة 1 أعلاه)

### ❌ Invalid Ad Account ID:
```json
{
  "error": {
    "message": "(#803) Some of the aliases you requested do not exist: act_xxxxx",
    "type": "OAuthException",
    "code": 803
  }
}
```

**الحل:** راجع Ad Account ID من Ads Manager (الخطوة 3 أعلاه)

### ❌ Insufficient Permissions:
```json
{
  "error": {
    "message": "Permissions error",
    "type": "OAuthException",
    "code": 200
  }
}
```

**الحل:** أضف صلاحيات `ads_management` و `ads_read` للـ Token

---

## 🔄 بدائل للتحقق:

### استخدم الموقع مباشرة:

1. **افتح إعدادات Facebook:**
   ```
   https://www.remostore.net/admin/facebook-settings
   ```

2. **حدّث الـ Access Token** من هناك

3. **احفظ** وجرب مرة تانية

---

## 📝 ملاحظات:

- **Access Token بينتهي:** يجب تجديده كل 60 يوم
- **Long-Lived Token:** يفضل استخدام Long-Lived Token (60 يوم)
- **System User Token:** للاستخدام الدائم (لا ينتهي)

---

## 🎯 النتيجة المتوقعة:

بعد الإصلاح، هتشوف:

```
┌─────────────────────────────┐
│ 💰 رصيد Facebook Ads       │
├─────────────────────────────┤
│ الرصيد المتاح              │
│ 500.00 EGP                  │
│                             │
│ إجمالي الإنفاق: 1,200.00   │
│ حد الإنفاق: غير محدد       │
│                             │
│ الحساب: xxxxxx              │
│ ID: act_1962278932225       │
└─────────────────────────────┘
```

---

**تاريخ التحديث:** 21 فبراير 2026  
**الإصدار:** 2.1.0
