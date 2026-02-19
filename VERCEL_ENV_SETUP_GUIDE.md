# 🔧 دليل إنشاء Environment Variables في Vercel - خطوة بخطوة

## الخطوة 1️⃣: الدخول إلى Vercel

1. افتح المتصفح واذهب إلى: **https://vercel.com/login**
2. سجل الدخول بحسابك
3. ستظهر لك الـ Dashboard

---

## الخطوة 2️⃣: اختيار المشروع

1. في الـ Dashboard، ابحث عن مشروعك (اسمه: `brandstore` أو `remostore`)
2. اضغط على المشروع للدخول إليه

---

## الخطوة 3️⃣: فتح Settings

1. في صفحة المشروع، ستجد تبويبات في الأعلى:
   - Overview
   - Deployments
   - Analytics
   - **Settings** ← اضغط هنا
   - Marketplace

2. اضغط على **Settings**

---

## الخطوة 4️⃣: فتح Environment Variables

في الـ Settings، ستجد قائمة على اليسار:
- General
- Domains
- Git
- **Environment Variables** ← اضغط هنا
- Security
- etc.

اضغط على **Environment Variables**

---

## الخطوة 5️⃣: إضافة أول متغير (DATABASE_URL)

الآن ستشوف صفحة فيها:
- عنوان: "Environment Variables"
- زر: **"Add New"** أو **"Create"** ← اضغط عليه

### سيظهر نموذج فيه 3 حقول:

#### الحقل الأول: Name (الاسم)
```
DATABASE_URL
```

#### الحقل الثاني: Value (القيمة)
```
postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### الحقل الثالث: Environment (البيئة)
حدد الـ checkboxes:
- ✅ Production
- ✅ Preview  
- ✅ Development

ثم اضغط **Save** أو **Add**

---

## الخطوة 6️⃣: إضافة باقي المتغيرات

كرر نفس العملية (اضغط Add New) لكل متغير:

### المتغير الثاني: NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: dPJmbxjVNQHfR03jS22yl9jVY2DOsiQQmSHBJv/xZms=
Environment: ✅ Production ✅ Preview ✅ Development
```

### المتغير الثالث: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://www.remostore.net
Environment: ✅ Production فقط
```

### المتغير الرابع: NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://www.remostore.net
Environment: ✅ Production
```

### المتغير الخامس: NEXT_PUBLIC_SITE_URL
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://www.remostore.net
Environment: ✅ Production
```

### المتغير السادس: PRODUCTION_URL
```
Name: PRODUCTION_URL
Value: https://www.remostore.net
Environment: ✅ Production
```

### المتغير السابع: NEXT_PUBLIC_SITE_NAME
```
Name: NEXT_PUBLIC_SITE_NAME
Value: RemoStore
Environment: ✅ Production
```

### المتغير الثامن: CSRF_SECRET
```
Name: CSRF_SECRET
Value: A7kN9pR2vX5wZ8bQ3mY6dF4hL1jT0sC9eG7uI2oP5nK8
Environment: ✅ Production ✅ Preview ✅ Development
```

---

## الخطوة 7️⃣: إضافة OpenAI و Cloudinary (مهم!)

افتح ملف `.env` في مشروعك المحلي وانسخ القيم:

### OpenAI
```
Name: OPENAI_API_KEY
Value: [انسخ من ملف .env المحلي]
Environment: ✅ Production
```

### Cloudinary
```
Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: [انسخ من ملف .env المحلي]
Environment: ✅ Production ✅ Preview ✅ Development
```

```
Name: CLOUDINARY_API_KEY
Value: [انسخ من ملف .env المحلي]
Environment: ✅ Production
```

```
Name: CLOUDINARY_API_SECRET
Value: [انسخ من ملف .env المحلي]
Environment: ✅ Production
```

---

## الخطوة 8️⃣: إعادة النشر (Redeploy)

بعد إضافة **كل** المتغيرات:

1. اضغط على تبويب **Deployments** (في أعلى الصفحة)
2. ستجد قائمة بالـ deployments
3. اضغط على أحدث deployment (الأول في القائمة)
4. ستفتح صفحة تفاصيل الـ deployment
5. ابحث عن زر الـ 3 نقاط `...` في أعلى اليمين
6. اضغط عليه واختر **"Redeploy"**
7. ستظهر نافذة تأكيد، اضغط **"Redeploy"**

---

## الخطوة 9️⃣: الانتظار

- سيبدأ Vercel في عمل build جديد
- شاهد الـ logs (ستظهر تلقائياً)
- انتظر حتى يكتمل البناء (2-3 دقائق)
- ستجد رسالة: **"Deployment Ready"** مع علامة ✓ خضراء

---

## الخطوة 🔟: اختبار الموقع

1. افتح متصفح جديد (Private/Incognito)
2. اذهب إلى: **https://www.remostore.net**
3. المفروض الموقع يشتغل الآن! ✅

---

## ❓ لو ظهرت مشاكل:

### مشكلة 1: Build Failed (فشل البناء)
- ارجع لـ Build Logs
- ابحث عن السطر الأحمر
- ابعتلي الخطأ بالضبط

### مشكلة 2: Error: Cannot find module 'prisma'
- تأكد من أن `DATABASE_URL` موجود
- تأكد من الـ value صحيح (بدون مسافات زيادة)

### مشكلة 3: NextAuth Error
- تأكد من `NEXTAUTH_URL` = `https://www.remostore.net` (بدون سلاش في الآخر)
- تأكد من `NEXTAUTH_SECRET` موجود

---

## ✅ التأكد من نجاح العملية:

في Vercel → Settings → Environment Variables:
- يجب أن تشوف **على الأقل 8 متغيرات**
- كل متغير له environment محددة (Production, Preview, etc.)

---

## 📞 محتاج مساعدة؟

خذ screenshot من:
1. صفحة Environment Variables في Vercel
2. Build Logs (لو فيه خطأ)

وابعتهم لي
