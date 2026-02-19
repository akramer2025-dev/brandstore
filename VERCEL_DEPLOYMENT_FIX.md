# 🚨 حل مشكلة ERR_CONNECTION_REFUSED على Vercel

## المشكلة:
الموقع www.remostore.net لا يعمل ويظهر خطأ `ERR_CONNECTION_REFUSED`

## السبب:
الـ Environment Variables في Vercel غير مضبوطة أو ناقصة

---

## ✅ الحل السريع (خطوة بخطوة):

### 1️⃣ افتح Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2️⃣ اختر المشروع (brandstore أو remostore)

### 3️⃣ اذهب إلى Settings → Environment Variables

### 4️⃣ أضف المتغيرات التالية (CRITICAL):

#### Database (أهم حاجة!)
```
DATABASE_URL = postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```
- Environment: ✅ Production ✅ Preview ✅ Development

#### NextAuth (Authentication)
```
NEXTAUTH_SECRET = dPJmbxjVNQHfR03jS22yl9jVY2DOsiQQmSHBJv/xZms=
NEXTAUTH_URL = https://www.remostore.net
```
- Environment: ✅ Production

```
NEXTAUTH_URL = https://[your-preview-url].vercel.app
```
- Environment: ✅ Preview

#### App URLs
```
NEXT_PUBLIC_APP_URL = https://www.remostore.net
NEXT_PUBLIC_SITE_URL = https://www.remostore.net
PRODUCTION_URL = https://www.remostore.net
NEXT_PUBLIC_SITE_NAME = RemoStore
```
- Environment: ✅ Production

#### Security
```
CSRF_SECRET = A7kN9pR2vX5wZ8bQ3mY6dF4hL1jT0sC9eG7uI2oP5nK8
```
- Environment: ✅ Production ✅ Preview ✅ Development

---

### 5️⃣ أضف باقي المتغيرات من `.env` المحلي:

افتح ملف `.env` عندك وانسخ هذه المتغيرات:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- أي متغيرات أخرى موجودة

---

### 6️⃣ احفظ ثم اعمل Redeploy

**طريقة 1 - من Vercel Dashboard:**
1. اذهب إلى Deployments
2. اختر آخر deployment
3. اضغط على الـ 3 نقاط (...)
4. اختر "Redeploy"

**طريقة 2 - من Git:**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

---

## 🔍 فحص الحالة:

### تأكد من:
1. ✅ Database متصل (Neon Postgres)
2. ✅ كل Environment Variables موجودة
3. ✅ Build نجح بدون أخطاء
4. ✅ Domain متوصل صح

### لو ما زال مش شغال:

#### فحص Deployment Logs:
1. Vercel Dashboard → Deployments
2. اضغط على آخر deployment
3. شوف الـ Build Logs
4. ابحث عن أخطاء حمراء

#### أخطاء شائعة:
- ❌ `Prisma Client not found` → روح Settings → General → Node.js Version → اختار 18.x
- ❌ `Database connection failed` → تأكد من DATABASE_URL صحيح
- ❌ `NextAuth configuration error` → تأكد من NEXTAUTH_URL و NEXTAUTH_SECRET

---

## 📱 تأكد من الدومين:

### في Vercel Dashboard → Settings → Domains:
يجب أن يكون:
```
www.remostore.net
remostore.net (redirect to www)
```

### DNS Settings (عند مزود الدومين):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🚀 بعد كل حاجة:

1. انتظر 2-3 دقائق للـ deployment
2. افتح الموقع في Private/Incognito Window
3. امسح الـ cache: Ctrl + Shift + R (Windows) أو Cmd + Shift + R (Mac)
4. جرب من موبايل على 4G/5G (مش WiFi)

---

## ✅ لو نجح:
الموقع المفروض يشتغل على:
- https://www.remostore.net ✅
- https://remostore.net ✅ (redirect)

---

## 📞 لو ما زال مش شغال:

افحص الـ logs وابعتلي الخطأ المكتوب بالضبط
