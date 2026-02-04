# ✅ قائمة المتغيرات المطلوبة في Vercel

## 🔴 مهم جداً - تحقق من هذه المتغيرات

### 1️⃣ NextAuth (ضروري للـ Session)
```
NEXTAUTH_SECRET = dPJmbxjVNQHfR03jS22yl9jVY2DOsiQQmSHBJv/xZms=
NEXTAUTH_URL = https://www.remostore.net
```

⚠️ **تأكد إن المتغير اسمه `NEXTAUTH_URL` وليس `EXTAUTH_URL`**

### 2️⃣ Database
```
DATABASE_URL = postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3️⃣ Cloudinary (لرفع الصور)
```
CLOUDINARY_CLOUD_NAME = disd7lhsd
CLOUDINARY_API_KEY = 771537117787565
CLOUDINARY_API_SECRET = V7Z7rt_8j7TJJqILg7pkYeflk6A
```

### 4️⃣ Google OAuth (اختياري)
```
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
```

### 5️⃣ Push Notifications (اختياري)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BAFfxm1n3LekI2WupOuXkBoWhqEFtYfa-km64ZD8xC2oKggixZhBenlpfNcOjQiQysAb3FwrBsVRIodcYyuTiFU
VAPID_PRIVATE_KEY = 60tBaU4cC-hoax7ND3Rjud_q1UG-QwEIpDqtfll-NJI
```

## 🔧 كيفية التحقق

1. اذهب إلى: https://vercel.com/akramer2025-dev/brandstore/settings/environment-variables
2. تأكد من وجود **جميع** المتغيرات أعلاه
3. تأكد من صحة الأسماء (خاصة `NEXTAUTH_URL`)
4. اضغط **Redeploy** بعد أي تغيير

## ❌ أخطاء شائعة

### الخطأ: 401 Unauthorized
**السبب:** `NEXTAUTH_URL` غلط أو مش موجود
**الحل:** تأكد من `NEXTAUTH_URL = https://www.remostore.net`

### الخطأ: Session is null
**السبب:** `NEXTAUTH_SECRET` مش موجود
**الحل:** أضف `NEXTAUTH_SECRET` من الملف أعلاه

### الخطأ: Database connection failed
**السبب:** `DATABASE_URL` غلط
**الحل:** انسخ الرابط بالظبط من أعلاه

## 🎯 بعد التعديل

1. احفظ المتغيرات
2. اذهب **Deployments**
3. اختر آخر deployment
4. اضغط **Redeploy**
5. انتظر 2-3 دقائق
6. جرب الموقع

---

**آخر تحديث:** 4 فبراير 2026
