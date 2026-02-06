# 🔐 دليل تفعيل Google OAuth

## الخطوات بالتفصيل:

### 1️⃣ إنشاء مشروع في Google Cloud Console

1. افتح: [Google Cloud Console](https://console.cloud.google.com/)
2. اضغط **"Select a project"** 
3. اضغط **"New Project"**
4. اكتب اسم المشروع: **Remostore**
5. اضغط **"Create"**

### 2️⃣ تفعيل Google+ API

1. من القائمة الجانبية: **"APIs & Services"** → **"Library"**
2. ابحث عن: **"Google+ API"**
3. اضغط **"Enable"**

### 3️⃣ إنشاء OAuth 2.0 Credentials

1. من القائمة الجانبية: **"APIs & Services"** → **"Credentials"**
2. اضغط **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. لو أول مرة، هتحتاج تعمل **"Configure Consent Screen"**:
   - اختار **"External"**
   - اكتب اسم التطبيق: **Remostore**
   - اكتب بريدك الإلكتروني
   - اضغط **"Save and Continue"**
   - اضغط **"Save and Continue"** في باقي الصفحات
4. ارجع لـ **"Credentials"** واضغط **"Create Credentials"**

### 4️⃣ ضبط OAuth Client

1. **Application type:** Web application
2. **Name:** Remostore Web Client
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://192.168.3.17:3000
   https://yourdomain.com
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   http://192.168.3.17:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
5. اضغط **"Create"**

### 5️⃣ نسخ Credentials

بعد الإنشاء، هتظهرلك نافذة فيها:
- **Client ID** (مثال: `12345-abcde.apps.googleusercontent.com`)
- **Client Secret** (مثال: `GOCSPX-abc123xyz`)

**انسخهم دلوقتي! 📋**

### 6️⃣ تحديث ملف .env

افتح `d:\markting\.env` وحط:
```env
GOOGLE_CLIENT_ID=12345-abcde.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
```

### 7️⃣ تفعيل Google OAuth في الكود

الكود معطل مؤقتاً لأن الـ credentials مش موجودة. بعد ما تحط الـ credentials الصحيحة:

1. افتح `src/lib/auth.ts`
2. حط الكود ده بدل اللي معطل:
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
}),
```

3. افتح `src/app/auth/login/page.tsx`
4. شيل التعليق من زر Google

### 8️⃣ إعادة تشغيل السيرفر

```bash
npm run dev
```

---

## ✅ اختبار Google OAuth

1. افتح: `http://localhost:3000/auth/login`
2. اضغط **"تسجيل الدخول بـ Google"**
3. اختار حساب Google الخاص بك
4. اسمح بالأذونات
5. لازم يتم تسجيل دخولك بنجاح! ✨

---

## 🚨 مشاكل شائعة

### "redirect_uri_mismatch"
**الحل:** تأكد إن الـ redirect URI في Google Console بالظبط زي اللي في الكود

### "Access blocked"
**الحل:** روح على OAuth consent screen وضيف نفسك كـ "Test user"

### "Missing required parameter: client_id"
**الحل:** تأكد إن الـ Client ID موجود في `.env` وإن السيرفر متعمل restart

---

## 📚 روابط مفيدة

- [Google Cloud Console](https://console.cloud.google.com/)
- [NextAuth Google Provider Docs](https://next-auth.js.org/providers/google)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
