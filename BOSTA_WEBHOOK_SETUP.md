# 🔗 إعداد Webhook مع بوسطة - Remostore

## ✅ معلومات الموقع

**Domain:** www.remostore.net  
**API Key:** ✅ موجود في `.env`

---

## 🎯 الـ Webhook URL الصحيح

### ضعه في Dashboard بوسطة:

```
https://www.remostore.net/api/webhooks/bosta
```

أو بدون www:

```
https://remostore.net/api/webhooks/bosta
```

**⚠️ مهم:** استخدم اللي بيشتغل من الاختيارين (جرب الموقع بنفسك)

---

## 📋 خطوات الإعداد (5 دقائق)

### 1️⃣ افتح Dashboard بوسطة
```
https://app.bosta.co/
```

### 2️⃣ دور على قسم:
- **"الإعدادات"** أو **"Settings"**
- **"ربط التطبيقات"** أو **"API Integration"**
- **"Webhooks"** أو **"إشعارات"**

### 3️⃣ أضف Webhook URL
```
https://www.remostore.net/api/webhooks/bosta
```

### 4️⃣ اختار الـ Events المطلوبة:
اختار كل الأحداث دي:
- ✅ Ticket Created (تم إنشاء الشحنة)
- ✅ Picked Up (تم الاستلام)
- ✅ In Transit (في الطريق)
- ✅ Out for Delivery (خرج للتوصيل)
- ✅ Delivered (تم التوصيل)
- ✅ Failed Delivery (فشل التوصيل)
- ✅ Returned (مرجع)

### 5️⃣ احفظ الإعدادات ✅

---

## 🔐 لو طلبوا Webhook Secret

إذا أعطاك بوسطة **Webhook Secret**، ضعه في `.env`:

```env
BUSTA_WEBHOOK_SECRET="SECRET_FROM_BOSTA"
```

---

## 🧪 اختبار الـ Webhook

### الطريقة 1: من بوسطة مباشرة
لو في Dashboard بوسطة فيه زر "Test Webhook" أو "اختبار":
- اضغط عليه
- شوف لو وصل عندك في Logs

### الطريقة 2: جرب شحنة حقيقية
1. أنشئ طلب تجريبي
2. اشحنه مع بوسطة
3. راقب التحديثات التلقائية

---

## 📊 كيف تتأكد إن الـ Webhook شغال؟

### افتح Terminal وشغل:
```bash
npm run dev
```

### راقب الـ Logs:
لما بوسطة يبعت Webhook، هتشوف رسايل زي:
```
📦 ========================================
📦 Bosta Webhook Received
📦 ========================================
✅ Order found: ORD-12345
✅ Order updated successfully
```

---

## 🔍 تتبع الشحنات

### بعد إعداد الـ Webhook:

**تلقائياً:** لما بوسطة يحدث حالة الشحنة، نظامك هيتحدث تلقائياً! ✅

**URL التتبع للعملاء:**
```
https://bosta.co/tracking/TRACKING_NUMBER
```

---

## 📝 Environment Variables - المراجعة النهائية

تأكد إن في `.env` عندك:

```env
# Bosta Shipping
BUSTA_API_KEY="e4811f5cd1477c9d386f173921215b0cd3e81caa6deee89ff41e4d1390186ced"
BUSTA_API_URL="https://api.bosta.co/v1"
BUSTA_MERCHANT_ID="YOUR_MERCHANT_ID"  # لو طلبوه
BUSTA_WEBHOOK_SECRET="YOUR_SECRET"     # لو طلبوه
SHIPPING_COMPANY="BOSTA"

# Your Domain
NEXTAUTH_URL="https://www.remostore.net"
```

---

## 🚀 API Endpoints الجاهزة

### إرسال طلب للشحن:
```http
POST https://www.remostore.net/api/orders/:id/ship
```

### استقبال Webhooks (تلقائي):
```http
POST https://www.remostore.net/api/webhooks/bosta
```

### صفحة إدارة الشحنات:
```
https://www.remostore.net/admin/shipping
```

---

## ✅ Checklist

- [ ] API Key موجود في `.env` ✅
- [ ] Webhook URL تم إضافته في بوسطة
- [ ] اختبار اتصال API (run: `npx ts-node test-bosta-connection.ts`)
- [ ] اختبار Webhook
- [ ] جرب إرسال طلب تجريبي

---

## 📞 معلومات الاتصال

**الموقع:** www.remostore.net  
**Webhook Endpoint:** /api/webhooks/bosta  
**Platform:** Custom Next.js  
**Status:** ✅ Production Ready

---

## 🎯 الخطوة التالية

### الآن:
1. ✅ افتح https://app.bosta.co/
2. ✅ روح الإعدادات → Webhooks
3. ✅ أضف: `https://www.remostore.net/api/webhooks/bosta`
4. ✅ احفظ

### بعدها:
- جرب إرسال طلب تجريبي
- راقب الـ Webhooks
- شوف التحديثات التلقائية

---

**🎉 نظامك جاهز للإنتاج!**

لو عندك أي سؤال أو واجهتك مشكلة، راجع:
- `BOSTA_INTEGRATION_STEPS.md` - الدليل الشامل
- `BOSTA_READY.md` - دليل البدء السريع
