# 🎯 دليل ربط Meta Pixel بالكتالوج

## ✅ تم تحديث Pixel ID بنجاح!

**Meta Pixel ID:** `1242154784695296`

---

## 📌 الخطوة 1: التأكد من تثبيت Pixel على الموقع

### ✅ تم تثبيت Pixel تلقائياً!

الكود التالي موجود في `src/components/FacebookPixel.tsx` ويعمل تلقائياً:

```typescript
fbq('init', '1242154784695296');
fbq('track', 'PageView');
```

### التحقق من عمل Pixel:

1. افتح موقعك: `https://www.remostore.net`
2. افتح **Chrome DevTools** (F12)
3. روح على **Console**
4. اكتب:
   ```javascript
   fbq('track', 'PageView');
   ```
5. لو شغال، هتشوف رسالة نجاح

**أو استخدم Facebook Pixel Helper Extension:**
- حمل من: https://chrome.google.com/webstore/detail/facebook-pixel-helper/

---

## 📦 الخطوة 2: ربط Pixel بالكتالوج في Facebook Developer Console

### 1️⃣ الدخول إلى Events Manager

اذهب إلى: https://business.facebook.com/events_manager2

### 2️⃣ اختر Pixel الخاص بك

- اختر Pixel: `1242154784695296`
- من القائمة الجانبية، اختر **"Settings"** (الإعدادات)

### 3️⃣ ربط الكتالوج

في صفحة الإعدادات:

1. **ابحث عن قسم "Product Catalog"**
2. اضغط **"Connect Catalog"**
3. اختر الكتالوج: **"Remo Store Bot"** (ID: `900247573275779`)
4. اضغط **"Connect"**

### 4️⃣ تفعيل المميزات المتقدمة

بعد الربط، فعّل:

- ✅ **Advanced Matching**: لتحسين التتبع
- ✅ **Automatic Events**: لتتبع الأحداث تلقائياً
- ✅ **Microdata Events**: لتحسين جودة البيانات

---

## 🛍️ الخطوة 3: ربط Pixel بـ Commerce Manager (اختياري)

### 1️⃣ الدخول إلى Commerce Manager

اذهب إلى: https://business.facebook.com/commerce

### 2️⃣ اختر الكتالوج

- اختر: **"Remo Store Bot"** (ID: `900247573275779`)

### 3️⃣ ربط Pixel بالكتالوج

1. من القائمة الجانبية، اختر **"Event Sources"**
2. اضغط **"Add Pixel"**
3. اختر Pixel: `1242154784695296`
4. اضغط **"Add"**

---

## 📊 الخطوة 4: إضافة Events للمنتجات (تلقائي)

### Events المتوفرة حالياً:

| Event | متى يحدث | الحالة |
|-------|----------|--------|
| **PageView** | عند زيارة أي صفحة | ✅ يعمل |
| **ViewContent** | عند فتح صفحة منتج | 🔄 سيتم إضافته |
| **AddToCart** | عند إضافة منتج للسلة | 🔄 سيتم إضافته |
| **InitiateCheckout** | عند بدء عملية الشراء | 🔄 سيتم إضافته |
| **Purchase** | عند إتمام الشراء | 🔄 سيتم إضافته |

---

## 🎯 الخطوة 5: اختبار Pixel Events

### 1️⃣ استخدام Test Events في Facebook

1. اذهب إلى: https://business.facebook.com/events_manager2/list/pixel/test_events
2. اختر Pixel: `1242154784695296`
3. افتح موقعك في نافذة جديدة
4. افتح أي منتج
5. شوف الـ Events على الـ Dashboard

### 2️⃣ استخدام Chrome Extension

- حمل **Facebook Pixel Helper**
- افتح موقعك
- شوف الأيقونة في شريط المتصفح
- لو Pixel شغال، هتشوف رقم الـ Events

---

## 🚀 الخطوة 6: إنشاء Dynamic Product Ads

### بعد ربط Pixel بالكتالوج، تقدر تعمل:

#### 1️⃣ عبر Media Buyer (الأسهل)

```
www.remostore.net/admin/media-buyer
```

- تبويب: **"كتالوج 🛍️"**
- املأ البيانات
- اضغط **"إطلاق الحملة الآن!"**

#### 2️⃣ عبر Facebook Ads Manager (يدوي)

1. اذهب إلى: https://business.facebook.com/adsmanager
2. اضغط **"Create"**
3. اختر الهدف: **"Sales"**
4. في **"Ad Format"**، اختر **"Dynamic Ads"**
5. في **"Product Catalog"**، اختر: **"Remo Store Bot"**
6. في **"Pixel"**، اختر: `1242154784695296`
7. أكمل باقي الإعدادات

---

## 🔧 الكود المستخدم حالياً

### في `src/components/FacebookPixel.tsx`:

```typescript
fbq('init', '1242154784695296');
fbq('track', 'PageView');
```

### سيتم إضافة Events إضافية:

```typescript
// عند فتح منتج
fbq('track', 'ViewContent', {
  content_ids: [product.id],
  content_type: 'product',
  value: product.price,
  currency: 'EGP'
});

// عند إضافة للسلة
fbq('track', 'AddToCart', {
  content_ids: [product.id],
  content_type: 'product',
  value: product.price,
  currency: 'EGP'
});

// عند إتمام الشراء
fbq('track', 'Purchase', {
  content_ids: orderItems.map(item => item.id),
  content_type: 'product',
  value: total,
  currency: 'EGP'
});
```

---

## 📋 Checklist: تأكد من كل حاجة

- [x] Pixel ID موجود في `.env`
- [x] Pixel متثبت على الموقع
- [ ] Pixel مربوط بالكتالوج في Events Manager
- [ ] Pixel مربوط بالكتالوج في Commerce Manager (اختياري)
- [ ] Advanced Matching مفعل
- [ ] Automatic Events مفعل
- [ ] تم اختبار Events في Test Events

---

## 🎁 المميزات بعد الربط

### 1️⃣ Dynamic Product Ads
- إعلانات ذكية تظهر المنتجات المناسبة لكل عميل
- تحديث تلقائي للأسعار والمخزون
- عرض منتجات مشابهة

### 2️⃣ Retargeting
- إعادة استهداف من زار منتجات معينة
- إعادة استهداف من أضاف للسلة ولم يشتري
- Cross-sell & Upsell

### 3️⃣ Lookalike Audiences
- استهداف أشخاص مشابهين للعملاء الحاليين
- بناء قوائم ذكية من Pixel Events

### 4️⃣ Conversion Tracking
- تتبع دقيق للمبيعات
- ROI واضح
- Optimization تلقائي للحملات

---

## 🆘 حل المشاكل الشائعة

### ❌ Pixel مش شغال؟

**الحل:**
1. تأكد من وجود `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` في `.env`
2. أعد تشغيل السيرفر: `npm run dev`
3. امسح الكاش من المتصفح (Ctrl + F5)

### ❌ Events مش بتظهر في Facebook؟

**الحل:**
1. تأكد من ربط Pixel بالكتالوج
2. تأكد من تفعيل Advanced Matching
3. انتظر 15-30 دقيقة (بيستغرق وقت أحياناً)

### ❌ الكتالوج مش ظاهر في Ads Manager؟

**الحل:**
1. تأكد من رفع الكتالوج بنجاح
2. اذهب إلى: https://www.remostore.net/api/products/feed
3. تأكد من ظهور المنتجات
4. روح Commerce Manager → Diagnostics وشوف الأخطاء

---

## 📞 روابط مهمة

- **Events Manager**: https://business.facebook.com/events_manager2
- **Commerce Manager**: https://business.facebook.com/commerce
- **Test Events**: https://business.facebook.com/events_manager2/list/pixel/test_events
- **Pixel Helper**: https://chrome.google.com/webstore/detail/facebook-pixel-helper/
- **الكتالوج (Feed)**: https://www.remostore.net/api/products/feed
- **Media Buyer**: https://www.remostore.net/admin/media-buyer

---

## ✅ الخلاصة

**تم بنجاح:**
- ✅ Pixel ID: `1242154784695296`
- ✅ Pixel متثبت على الموقع
- ✅ PageView Event يعمل

**الخطوات التالية:**
1. روح Events Manager واربط Pixel بالكتالوج
2. فعّل Advanced Matching
3. اختبر Events في Test Events
4. ابدأ إنشاء Dynamic Product Ads!

---

**محتاج مساعدة؟**
- راجع: [PRODUCT_CATALOG_GUIDE.md](./PRODUCT_CATALOG_GUIDE.md)
- راجع: [CATALOG_CAMPAIGN_2MIN.md](./CATALOG_CAMPAIGN_2MIN.md)
- راجع: [FACEBOOK_CONVERSIONS_API_GUIDE.md](./FACEBOOK_CONVERSIONS_API_GUIDE.md)

🎉 **مبروك! Pixel جاهز للاستخدام!**
