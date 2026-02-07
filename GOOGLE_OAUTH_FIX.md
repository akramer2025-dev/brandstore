# إصلاح مشكلة Google OAuth - تسجيل الدخول

## المشكلة
عند محاولة تسجيل الدخول بحساب Google جديد:
1. يظهر شاشة موافقة Google ✅
2. يتم الموافقة وإعادة التوجيه ✅
3. **لكن يعود إلى صفحة تسجيل الدخول ولا يتم تسجيل الدخول** ❌

## السبب الرئيسي
**مشكلة في Redirect URLs**:
- NEXTAUTH_URL في `.env` مضبوط على `http://localhost:3000`
- لكن الموقع في production على `https://brandstore-lyart.vercel.app`
- Google OAuth يحاول إعادة التوجيه إلى localhost بدل production URL

## الحل الشامل

### 1️⃣ تحديث Vercel Environment Variables

افتح لوحة تحكم Vercel:
```
https://vercel.com/your-team/brandstore/settings/environment-variables
```

أضف/حدّث المتغيرات التالية:

#### Production Environment:
```env
NEXTAUTH_URL=https://brandstore-lyart.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
```

**مهم**: اضغط "Save" ثم "Redeploy" لتطبيق التغييرات!

---

### 2️⃣ تحديث Google Cloud Console

افتح: https://console.cloud.google.com/apis/credentials

1. اختر مشروعك
2. اضغط على OAuth 2.0 Client ID
3. في **Authorized redirect URIs**، أضف:

```
https://brandstore-lyart.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

4. اضغط **Save**

---

### 3️⃣ إصلاح الكود (تم تطبيقه ✅)

#### التحديثات في `src/lib/auth.ts`:

1. **إضافة حماية من redirect errors**:
   - إذا حدث خطأ في redirect، يذهب للصفحة الرئيسية
   - معالجة URLs الخارجية بشكل آمن

2. **تحسين signIn callback**:
   - التحقق من وجود email قبل المتابعة
   - معالجة أفضل للمستخدمين الجدد من Google

3. **إضافة allowDangerousEmailAccountLinking** (معطّل للأمان):
   - منع ربط حسابات مختلفة بنفس الإيميل

---

### 4️⃣ تحديث Custom Domain (إذا كنت تستخدم remostor.net)

إذا كنت تستخدم نطاق مخصص، أضف أيضاً:

#### في Vercel:
```env
NEXTAUTH_URL=https://www.remostor.net
```

#### في Google Console:
```
https://www.remostor.net/api/auth/callback/google
```

---

## الاختبار

### اختبار محلي (localhost):
```bash
# 1. تأكد من .env
NEXTAUTH_URL="http://localhost:3000"

# 2. شغّل المشروع
npm run dev

# 3. اذهب إلى
http://localhost:3000/auth/login

# 4. جرّب تسجيل الدخول بـ Google
```

### اختبار على Production:
```bash
# 1. Deploy آخر التحديثات
git add .
git commit -m "Fix Google OAuth redirect URLs"
git push origin main

# 2. انتظر Vercel يخلص deploy
# 3. اذهب إلى
https://brandstore-lyart.vercel.app/auth/login

# 4. جرّب تسجيل الدخول بـ Google
```

---

## تشخيص المشاكل

### إذا لم يعمل بعد:

#### 1. افحص Console Logs:
افتح DevTools (F12) وشوف Console:
```javascript
// لازم تشوف هذه الرسائل:
🔐 SignIn callback - Provider: google, Email: user@gmail.com
👤 Existing user found: ... أو 🆕 New user from Google
🔄 Redirect callback - URL: ...
✅ Redirecting to: ...
```

#### 2. افحص Network Tab:
- تأكد من requests تروح على:
  - `/api/auth/signin/google`
  - `/api/auth/callback/google`
  - لا يوجد errors (400, 401, 500)

#### 3. افحص Vercel Logs:
```bash
vercel logs https://brandstore-lyart.vercel.app --follow
```

ابحث عن:
- `❌ Error in signIn callback`
- `❌ No email provided`
- أي أخطاء في Google OAuth

---

## الأخطاء الشائعة وحلولها

### ❌ Error: redirect_uri_mismatch
**السبب**: URL غير مطابق في Google Console

**الحل**: 
1. اذهب إلى Google Console
2. تأكد من إضافة:
   ```
   https://brandstore-lyart.vercel.app/api/auth/callback/google
   ```
3. انتظر 5 دقائق للتطبيق

---

### ❌ Error: invalid_client
**السبب**: Google Client ID أو Secret خطأ

**الحل**:
1. افتح Google Console
2. انسخ Client ID و Client Secret الجديدة
3. حدّث في Vercel Environment Variables
4. Redeploy

---

### ❌ يعود لصفحة Login بدون رسالة خطأ
**السبب**: NEXTAUTH_URL خطأ

**الحل**:
1. تأكد من NEXTAUTH_URL في Vercel:
   ```env
   NEXTAUTH_URL=https://brandstore-lyart.vercel.app
   ```
2. **لا تنسى** Redeploy بعد التحديث!

---

### ❌ Error: CSRF token mismatch
**السبب**: مشكلة في cookies أو session

**الحل**:
```javascript
// في console المتصفح:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## التحقق من Environment Variables

### محلياً (.env):
```bash
# اعرض المتغيرات
cat .env | grep -E "NEXTAUTH|GOOGLE"
```

يجب أن تشوف:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### على Vercel:
```bash
# استخدم Vercel CLI
vercel env ls

# أو اذهب إلى Vercel Dashboard:
# Settings > Environment Variables
```

---

## نصائح أمنية

### ⚠️ لا تشارك أبداً:
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- أي credentials أخرى

### ✅ احفظها في:
- Vercel Environment Variables (للـ production)
- `.env.local` (للـ development)
- **لا تضعها في** `.env` ولا تدفعها لـ GitHub

### 🔒 استخدم Secrets Manager:
```bash
# على Vercel
vercel env add NEXTAUTH_SECRET
# ثم اكتب القيمة (لن تظهر في terminal)
```

---

## المراجع

### NextAuth.js Docs:
- https://next-auth.js.org/configuration/providers/oauth
- https://next-auth.js.org/configuration/options#callbacks

### Google OAuth Setup:
- https://console.cloud.google.com/apis/credentials
- https://developers.google.com/identity/protocols/oauth2

### Vercel Environment Variables:
- https://vercel.com/docs/concepts/projects/environment-variables

---

## الدعم

إذا استمرت المشكلة:
1. افحص Vercel logs
2. افحص browser console
3. تأكد من جميع الخطوات أعلاه
4. جرّب مسح cache و cookies المتصفح

---

**آخر تحديث**: 7 فبراير 2026  
**الحالة**: ✅ تم إصلاح الكود + يحتاج تحديث Vercel Environment Variables
