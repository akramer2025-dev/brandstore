# إصلاح خطأ رفع الصور في إعدادات المتجر ✅

## المشكلة السابقة
عند محاولة رفع صورة الغلاف أو الشعار في صفحة "تخصيص المتجر"، كان يظهر خطأ:
```
api.cloudinary.com/v1_1/disd7lhsd/image/upload: 400 (Bad Request)
Upload error: Error: Failed to upload image
```

## السبب
- الكود كان يحاول الرفع مباشرة إلى Cloudinary باستخدام `upload_preset="remostore"`
- الـ preset "remostore" غير موجود أو غير مُعد بشكل صحيح في حساب Cloudinary
- الرفع المباشر من المتصفح أقل أماناً ولا يحتوي على validations

## الحل المطبق ✅

### 1. استخدام API Endpoint الآمن
تم تغيير دالة `uploadToCloudinary` لاستخدام `/api/upload` بدلاً من الرفع المباشر:

**قبل:**
```typescript
const response = await fetch(
  `https://api.cloudinary.com/v1_1/disd7lhsd/image/upload`,
  {
    method: "POST",
    body: formData,
  }
);
```

**بعد:**
```typescript
const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

### 2. تحسين `/api/upload` Endpoint
- ✅ إضافة دعم لـ folder parameter الديناميكي
- ✅ صور المتجر تُحفظ الآن في folder منفصل: `vendor-stores`
- ✅ صور المنتجات تُحفظ في folder: `products` (default)

## المميزات الجديدة 🎯

### الأمان
- ✅ **Signed Upload:** رفع آمن بدون الحاجة لـ upload_preset
- ✅ **Authentication:** التحقق من هوية المستخدم (VENDOR أو ADMIN فقط)
- ✅ **Rate Limiting:** حماية من رفع ملفات كثيرة
- ✅ **File Validation:** التحقق من نوع وحجم الملف

### الوظائف
- ✅ رفع حتى 10 ملفات في نفس الوقت
- ✅ أنواع مسموحة: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ حجم أقصى: 10 MB لكل ملف
- ✅ تحسين الصور تلقائياً (max 1000x1000, auto quality)
- ✅ تنظيف أسماء الملفات من المحارف الخطيرة

### التنظيم
```
cloudinary://
├── products/          # صور المنتجات
└── vendor-stores/     # صور متاجر الشركاء
    ├── cover images   # صور الغلاف
    └── logos          # الشعارات
```

## الاستخدام الجديد

### في صفحة الإعدادات
```typescript
// رفع صورة غلاف
const formData = new FormData();
formData.append("files", file);
formData.append("folder", "vendor-stores");

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
const imageUrl = data.urls[0]; // أول URL من النتائج
```

### في أي مكان آخر
```typescript
// رفع صور منتجات
const formData = new FormData();
formData.append("files", file);
// folder سيكون "products" تلقائياً

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

## الملفات المعدلة

1. **src/app/vendor/settings/page.tsx**
   - تغيير دالة `uploadToCloudinary` لاستخدام `/api/upload`
   - إضافة folder parameter: `vendor-stores`

2. **src/app/api/upload/route.ts**
   - إضافة دعم folder ديناميكي
   - Default folder: `products`
   - قراءة folder من formData

## اختبار الحل ✅

### الخطوات:
1. افتح `/vendor/settings?tab=customize`
2. اضغط على زر "تغيير الغلاف" أو أيقونة الكاميرا على الشعار
3. اختر صورة (jpg, png, webp - أقل من 10MB)
4. انتظر رفع الصورة
5. ✅ يجب أن ترى الصورة معروضة بنجاح

### النتيجة المتوقعة:
- ✅ رفع ناجح بدون أخطاء
- ✅ preview فوري للصورة
- ✅ رسالة نجاح: "تم رفع صورة الغلاف بنجاح" أو "تم رفع الشعار بنجاح"
- ✅ الصورة محفوظة في Cloudinary في folder: `vendor-stores`

## معلومات تقنية

### Response Format
```json
{
  "success": true,
  "urls": [
    "https://res.cloudinary.com/disd7lhsd/image/upload/v123/vendor-stores/..."
  ],
  "count": 1,
  "message": "تم رفع 1 ملف بنجاح",
  "remaining": 9
}
```

### Error Handling
```json
{
  "error": "حجم الملف يتجاوز 10MB",
  "fileSize": "12.5MB",
  "maxSize": "10MB"
}
```

## التحسينات المستقبلية

- [ ] إضافة image compression قبل الرفع
- [ ] دعم crop/resize في المتصفح
- [ ] progress bar للرفع
- [ ] معاينة متعددة للصور
- [ ] إمكانية حذف الصور من Cloudinary

## ملاحظات

⚠️ **هام:** تأكد من وجود متغيرات البيئة التالية:
```env
CLOUDINARY_CLOUD_NAME=disd7lhsd
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

✅ **Production:** الحل يعمل في Development و Production على حد سواء

🔒 **الأمان:** كل الرفع يمر عبر server-side validation

## الدعم

إذا واجهت أي مشكلة:
1. تأكد من حجم الصورة (أقل من 10MB)
2. تأكد من نوع الملف (jpg, png, webp)
3. تحقق من console للأخطاء
4. تأكد من تسجيل الدخول كـ VENDOR

---
**آخر تحديث:** 18 فبراير 2026
**الإصدار:** 2.0
**الحالة:** ✅ جاهز للاستخدام
