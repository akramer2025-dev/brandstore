# إعداد متغيرات البيئة على Vercel

## خطوات الإعداد:

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع الخاص بك
3. Settings → Environment Variables
4. أضف المتغيرات التالية:

---

## 🔴 متغيرات حرجة (CRITICAL - لازم تضيفها):

### Database
```plaintext
DATABASE_URL=YOUR_POSTGRESQL_DATABASE_URL_HERE
```
**مثال:**
```
postgresql://username:password@host.neon.tech/database?sslmode=require
```

### NextAuth (Authentication)
```plaintext
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE

NEXTAUTH_URL=https://www.remostore.net
```
**لإنشاء NEXTAUTH_SECRET جديد:**
```bash
openssl rand -base64 32
```

---

## 🟡 متغيرات مهمة (IMPORTANT):

### Google OAuth
```plaintext
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

### Cloudinary (Images)
```plaintext
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
```

### Web Push Notifications (PWA)
```plaintext
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY_HERE

VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY_HERE
```
**لإنشاء VAPID keys جديدة:**
```bash
npx web-push generate-vapid-keys
```

---

## 🟢 متغيرات اختيارية (OPTIONAL):

### Resend (Email Service)
```plaintext
RESEND_API_KEY=YOUR_RESEND_API_KEY_HERE
```

### Busta Shipping
```plaintext
BUSTA_EMAIL=shipping@busta-egypt.com
```

### OpenAI (AI Features)
```plaintext
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

---

## ⚙️ إعدادات مهمة:

### لكل متغير:
- ✅ اختر **Production** environment
- ✅ اختر **Preview** environment (اختياري)
- ✅ اختر **Development** environment (اختياري)

### بعد إضافة جميع المتغيرات:
1. احفظ التغييرات
2. اضغط على **Redeploy** في تبويب Deployments
3. اختر **Use existing Build Cache** = ❌ (No)
4. اضغط **Redeploy**

---

## 🔍 التحقق من النجاح:

### بعد إعادة النشر:
1. افتح الموقع: https://www.remostore.net
2. تأكد من عدم ظهور أخطاء Server Components
3. جرب تسجيل الدخول بـ Google
4. جرب إنشاء طلب جديد
5. تأكد من ظهور الصور بشكل صحيح

---

## ⚠️ ملاحظات:

### NEXTAUTH_URL
- في Production: `https://www.remostore.net`
- في Development: `http://localhost:3000`

### NEXT_PUBLIC_*
- أي متغير يبدأ بـ `NEXT_PUBLIC_` يكون visible للمتصفح
- احرص على عدم وضع أسرار في متغيرات NEXT_PUBLIC_

### Google OAuth
- لازم تضيف `https://www.remostore.net` في Authorized domains على Google Console
- لازم تضيف `https://www.remostore.net/api/auth/callback/google` في Authorized redirect URIs

---

## 🐛 إذا استمرت المشكلة:

1. تحقق من Vercel Logs:
   - اذهب إلى Deployments
   - اختر آخر deployment
   - اضغط على **View Function Logs**

2. ابحث عن الخطأ الحقيقي في الـ logs

3. إذا كان الخطأ متعلق بقاعدة البيانات:
   - تأكد من CONNECTION STRING صحيح
   - تأكد من `?sslmode=require` موجود في النهاية

4. إذا كان الخطأ متعلق بـ NextAuth:
   - تأكد من NEXTAUTH_SECRET موجود
   - تأكد من NEXTAUTH_URL صحيح

5. جرب عمل Clean Redeploy:
   ```bash
   # على جهازك المحلي
   rm -rf .next
   npm run build
   
   # على Vercel
   Redeploy without cache
   ```
