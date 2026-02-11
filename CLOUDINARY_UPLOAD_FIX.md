# إصلاح مشكلة رفع صور الإيصالات

## المشكلة
كان النظام يحاول رفع الصور مباشرة من المتصفح إلى Cloudinary باستخدام upload preset ('ml_default')، مما أدى إلى خطأ 400 (Bad Request).

## الحل المطبق

### 1. إنشاء API Server-Side
تم إنشاء API جديد في `/api/upload-receipt` لرفع إيصالات التحويل بشكل آمن:
- ✅ رفع آمن باستخدام Cloudinary signed upload
- ✅ التحقق من صلاحيات المستخدم
- ✅ التحقق من نوع وحجم الملف
- ✅ تخزين الصور في مجلد خاص `remostore/receipts`
- ✅ إضافة معلومات المستخدم للتتبع

### 2. تحديث صفحة Checkout
تم تحديث دالة `uploadReceiptToCloudinary` لاستخدام API الجديد بدلاً من الرفع المباشر.

## خطوات التأكد من عمل الرفع في Production (Vercel)

### الخطوة 1: إضافة متغيرات البيئة في Vercel
يجب إضافة المتغيرات التالية في Vercel Dashboard:

1. اذهب إلى: `your-project.vercel.app` → **Settings** → **Environment Variables**

2. أضف المتغيرات التالية:

```
CLOUDINARY_CLOUD_NAME=disd7lhsd
CLOUDINARY_API_KEY=771537117787565
CLOUDINARY_API_SECRET=V7Z7rt_8j7TJJqILg7pkYeflk6A
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=disd7lhsd
```

3. اختر Environment: **Production**, **Preview**, **Development**

4. احفظ التغييرات

### الخطوة 2: إعادة Deploy
بعد إضافة المتغيرات:
1. اذهب إلى **Deployments**
2. اضغط على آخر deployment
3. اضغط **Redeploy**

أو ببساطة:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### الخطوة 3: التحقق من Cloudinary

تأكد من أن حساب Cloudinary:
1. Cloud Name صحيح: `disd7lhsd`
2. API Key نشط
3. Upload settings تسمح بالرفع

يمكنك التحقق من: https://cloudinary.com/console

## الملفات المتأثرة

1. **src/app/api/upload-receipt/route.ts** (جديد)
   - API endpoint لرفع إيصالات التحويل
   
2. **src/app/checkout/page.tsx**
   - تحديث دالة uploadReceiptToCloudinary لاستخدام API الجديد

## المميزات الإضافية

- ✅ أمان أفضل: الرفع يتم من السيرفر بدلاً من المتصفح
- ✅ لا حاجة لإنشاء unsigned upload preset
- ✅ تخزين منظم في مجلد منفصل للإيصالات
- ✅ تتبع المستخدم الذي رفع الصورة
- ✅ رسائل خطأ واضحة بالعربية

## الاختبار

بعد deployment:
1. سجل دخول كعميل
2. أضف منتجات للسلة
3. اذهب لصفحة Checkout
4. حاول رفع صورة إيصال التحويل
5. يجب أن تظهر رسالة "جاري رفع صورة إيصال وي باي..."
6. ثم "تم رفع صورة إيصال وي باي بنجاح"

إذا ظهر خطأ، تحقق من:
- Console في المتصفح
- Logs في Vercel Dashboard
- إعدادات Cloudinary

## ملاحظات

- المجلد في Cloudinary: `remostore/receipts/`
- الحد الأقصى للملف: 5MB
- الأنواع المقبولة: JPEG, PNG, WebP, JPG
- الصورة يتم ضغطها تلقائياً للحفاظ على الجودة والسرعة
