# 🔍 دليل حل مشاكل Vercel - Debugging Guide

## المشكلة الحالية:
```
Application error: a server-side exception has occurred
Digest: 590221010
```

---

## 🔴 الخطوات العاجلة للحل:

### 1️⃣ فحص Vercel Logs (أهم خطوة!)

#### طريقة 1: من Dashboard
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع **remostore** (أو brandstore)
3. اضغط على **Deployments**
4. اضغط على آخر deployment (الأحدث)
5. اضغط على **View Function Logs**
6. ابحث عن السطر الأحمر (Error)
7. انسخ الخطأ كامل

#### طريقة 2: من Vercel CLI
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# عرض الـ logs
vercel logs
```

---

### 2️⃣ التحقق من DATABASE_URL

#### ✅ الصيغة الصحيحة:
```
postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require
```

#### ❌ أخطاء شائعة:
- ❌ نسيان `?sslmode=require` في النهاية
- ❌ وجود مسافات في البداية أو النهاية
- ❌ نسيان `@` بين Password والـ Host
- ❌ استخدام `http://` بدل `postgresql://`

#### 🔍 كيفية التحقق:
1. اذهب إلى **Neon Dashboard**: https://console.neon.tech
2. اختر المشروع
3. اضغط على **Connection Details**
4. انسخ **Connection String** كامل
5. تأكد أنها تنتهي بـ `?sslmode=require`

---

### 3️⃣ اختبار Database Connection

#### من متصفحك:
افتح: `https://www.remostore.net/api/health`

**النتيجة المتوقعة (إذا كان كل شيء سليم):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-06T..."
}
```

**إذا كان هناك خطأ:**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "رسالة الخطأ هنا",
  "timestamp": "2026-02-06T..."
}
```

---

### 4️⃣ التحقق من جميع المتغيرات المطلوبة

#### على Vercel Dashboard:
**Settings → Environment Variables**

#### ✅ Checklist (لازم تكون كلها موجودة):

##### 🔴 Critical (لازم 100%):
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`

##### 🟡 Important (مهمة جداً):
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- [ ] `VAPID_PRIVATE_KEY`

##### 🟢 Optional (اختيارية):
- [ ] `RESEND_API_KEY`
- [ ] `BUSTA_EMAIL`
- [ ] `OPENAI_API_KEY`

---

## 🛠️ حلول للمشاكل الشائعة:

### Problem 1: Database Connection Failed

**الأعراض:**
```
PrismaClientInitializationError
Can't reach database server
```

**الحل:**
1. تحقق من `DATABASE_URL` على Vercel
2. تأكد من `?sslmode=require` موجود
3. تأكد من عدم وجود مسافات
4. جرب الـ Connection String مباشرة من Neon Dashboard

---

### Problem 2: NEXTAUTH_SECRET Missing

**الأعراض:**
```
[next-auth][error][NO_SECRET]
Missing environment variable: NEXTAUTH_SECRET
```

**الحل:**
1. أضف `NEXTAUTH_SECRET` على Vercel
2. القيمة من ملف `.env` المحلي
3. أو أنشئ واحد جديد:
```bash
openssl rand -base64 32
```

---

### Problem 3: NEXTAUTH_URL Wrong

**الأعراض:**
- Google OAuth لا يعمل
- Redirect بعد Login يفشل

**الحل:**
تأكد من:
```
NEXTAUTH_URL=https://www.remostore.net
```
**ملاحظة:** 
- ✅ مع `www`
- ✅ مع `https`
- ❌ بدون `/` في النهاية

---

### Problem 4: Prisma Generate Failed

**الأعراض:**
```
Cannot find module '@prisma/client'
PrismaClient is unable to be run in the browser
```

**الحل:**
1. تأكد من `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

2. اعمل Clean Redeploy:
   - Deployments → Redeploy
   - **Don't use cache** ✅

---

## 🚀 Clean Redeploy (الحل النهائي):

إذا جربت كل شيء ولم ينجح:

### على Vercel:
1. اذهب إلى **Deployments**
2. اضغط على **Redeploy** للـ deployment الأخير
3. ✅ اختر **Don't use Build Cache**
4. اضغط **Redeploy**

### على جهازك:
```bash
# حذف .next وإعادة البناء
Remove-Item -Path .next -Recurse -Force
npm run build

# التأكد من عدم وجود أخطاء محلياً
npm run dev
# افتح http://localhost:3000
```

---

## 📊 Monitoring الموقع:

### أدوات مفيدة:

#### 1. Vercel Analytics
- اذهب إلى **Analytics** في Dashboard
- شاهد الـ Real-time visitors
- تحقق من الـ Performance metrics

#### 2. Vercel Logs
```bash
# Live logs
vercel logs --follow

# آخر 100 سطر
vercel logs -n 100
```

#### 3. Health Check
- افتح: `https://www.remostore.net/api/health`
- لو الـ status = "ok" → كل شيء يعمل
- لو الـ status = "error" → في مشكلة في Database

---

## 📝 Notes:

### Environment Variables في Vercel:
- تحتاج **Redeploy** بعد أي تغيير
- لا تنسى اختيار **Production** environment
- الـ Variables الـ `NEXT_PUBLIC_*` تكون visible للمتصفح

### Google OAuth:
لازم تضيف في Google Console:
- **Authorized domains:** `www.remostore.net`, `remostore.net`
- **Authorized redirect URIs:** `https://www.remostore.net/api/auth/callback/google`

### Neon Database:
- مجاني لحد 0.5 GB
- Sleep بعد 5 دقائق من عدم الاستخدام
- يصحى تلقائياً عند أول request (قد يأخذ 1-2 ثانية)

---

## 💡 إذا استمرت المشكلة:

1. ✅ افحص الـ **Vercel Logs** أولاً (أهم خطوة!)
2. ✅ جرب `/api/health` endpoint
3. ✅ تأكد من جميع الـ Environment Variables
4. ✅ اعمل Clean Redeploy بدون cache
5. ✅ تحقق من Google Console settings

**إذا مازال هناك مشكلة، انسخ الـ Error message من Vercel Logs وسأساعدك في حلها!** 🚀
