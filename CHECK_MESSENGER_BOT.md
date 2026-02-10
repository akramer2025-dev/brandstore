# ✅ فحص بوت الماسنجر - Troubleshooting

## 🔍 الخطوة 1: تحقق من Webhook Subscription

### في Facebook Developers:
1. اذهب إلى: https://developers.facebook.com/apps
2. افتح تطبيق "Remo Store Bot"
3. من القائمة → **Messenger** → **Settings**
4. في قسم **Webhooks**:
   - ✅ تأكد أن الـ Callback URL: `https://www.remostore.net/api/messenger/webhook`
   - ✅ تأكد أن **"messages"** event مفعّل (مُحدد)

### إذا لم يكن "messages" مفعّل:
1. اضغط **"Edit"** أو **"Manage"**
2. حدد **"messages"** 
3. اضغط **"Save"**

---

## 🔍 الخطوة 2: تحقق من Page Access Token

### اختبار Token:
افتح هذا الرابط في المتصفح (استبدل TOKEN بالـ token الموجود في .env):
```
https://graph.facebook.com/v18.0/me?access_token=YOUR_PAGE_ACCESS_TOKEN
```

### النتيجة المتوقعة:
```json
{
  "name": "BRAND STORE",
  "id": "103042954595602"
}
```

### إذا حصل خطأ:
- Token منتهي أو غير صحيح
- يجب توليد token جديد

---

## 🔍 الخطوة 3: فحص Logs في Vercel

1. اذهب إلى Vercel Dashboard
2. افتح المشروع
3. اذهب إلى **Logs** أو **Runtime Logs**
4. ابحث عن:
   - `📩 رسالة جديدة من Messenger`
   - أي أخطاء

---

## 🔍 الخطوة 4: اختبار Webhook يدوياً

### افتح Terminal وجرب:
```bash
curl -X POST "https://www.remostore.net/api/messenger/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [{
      "messaging": [{
        "sender": {"id": "test123"},
        "message": {"text": "test"}
      }]
    }]
  }'
```

---

## 🔧 الحل السريع الأكثر احتمالاً:

### إعادة Subscribe للـ Webhook:

1. **في Facebook Developers**:
   - Messenger → Settings → Webhooks
   - اضغط **"Edit"**
   - أعد اختيار **"messages"** event
   - اضغط **"Save"**

2. **أو استخدم Graph API**:
```bash
curl -X POST "https://graph.facebook.com/v18.0/103042954595602/subscribed_apps" \
  -d "access_token=YOUR_PAGE_ACCESS_TOKEN" \
  -d "subscribed_fields=messages"
```

---

## 📱 اختبار البوت:

### بعد التأكد من كل شيء:
1. افتح صفحة Facebook في نافذة متخفية (Incognito)
2. ابعث رسالة: "مرحبا"
3. راقب Vercel Logs
4. انتظر الرد

---

## ⚠️ مشاكل شائعة:

### 1. Token منتهي:
- احصل على token جديد من Page Settings
- حدّث في .env و Vercel

### 2. Webhook غير مُشترك:
- أعد subscribe للـ messages event

### 3. Page Role:
- تأكد أن الـ App له صلاحية على الصفحة

### 4. App Mode:
- تأكد أن الـ App في وضع **Live** (مش Development)

---

## 🆘 الحل الأخير:

إذا لم ينجح أي شيء:
1. احذف الـ Webhook من Facebook
2. أعد إضافته من جديد
3. أعد Subscribe للـ messages event
4. اختبر مرة أخرى
