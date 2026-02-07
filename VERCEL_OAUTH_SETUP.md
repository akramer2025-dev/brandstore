# خطوات إصلاح Google OAuth على Production (Vercel)

## المشكلة الحالية
✅ الإعدادات المحلية (.env) صحيحة  
❌ **NEXTAUTH_URL على Vercel لا يزال: http://localhost:3000**

هذا يسبب:
- Google OAuth يحاول إعادة التوجيه إلى localhost
- المستخدم يعود لصفحة Login بدون تسجيل دخول

## الحل (5 دقائق) ⏱️

### الخطوة 1: افتح Vercel Dashboard
اذهب إلى:
```
https://vercel.com/akramer2025-devs-projects/brandstore/settings/environment-variables
```

أو:
1. اذهب إلى https://vercel.com
2. اختر مشروع `brandstore`
3. اضغط **Settings**
4. اضغط **Environment Variables** من القائمة الجانبية

---

### الخطوة 2: حذف/تحديث NEXTAUTH_URL القديم

#### إذا كان موجود:
1. ابحث عن `NEXTAUTH_URL`
2. اضغط على الثلاث نقاط `⋮` بجانبه
3. اختر **Edit**
4. غيّر القيمة من:
   ```
   http://localhost:3000
   ```
   إلى:
   ```
   https://brandstore-lyart.vercel.app
   ```
5. تأكد من اختيار:
   - ✅ **Production**
   - ✅ **Preview** (اختياري)
   - ⬜ Development (اتركه فارغ)

#### إذا لم يكن موجود:
1. اضغط **Add New**
2. املأ:
   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://brandstore-lyart.vercel.app`
   - **Environments**: ✅ Production, ✅ Preview
3. اضغط **Save**

---

### الخطوة 3: تحديث Google Console Redirect URLs

افتح: https://console.cloud.google.com/apis/credentials

1. اختر مشروعك
2. اضغط على OAuth 2.0 Client ID الخاص بك
3. في **Authorized redirect URIs**:

   تأكد من وجود:
   ```
   https://brandstore-lyart.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   ```

4. اضغط **SAVE**
5. انتظر 2-3 دقائق للتطبيق

---

### الخطوة 4: Redeploy على Vercel

**مهم جداً!** Environment Variables لا تطبق إلا بعد Redeploy!

#### الطريقة 1: من Vercel Dashboard
1. اذهب إلى **Deployments** tab
2. اضغط على الثلاث نقاط `⋮` بجانب آخر deployment
3. اختر **Redeploy**
4. اضغط **Redeploy** للتأكيد

#### الطريقة 2: من Git
```bash
# اعمل commit فارغ لإجبار redeploy
git commit --allow-empty -m "Trigger redeploy for OAuth fix"
git push origin main
```

#### الطريقة 3: من Vercel CLI
```bash
vercel --prod
```

---

### الخطوة 5: انتظر وتحقق

1. انتظر Deploy ينتهي (2-3 دقائق) ⏱️
2. اذهب إلى: https://brandstore-lyart.vercel.app/auth/login
3. اضغط على "تسجيل الدخول بواسطة Google"
4. اختر حساب Google جديد
5. وافق على الأذونات
6. **يجب أن تدخل بنجاح! 🎉**

---

## التحقق من النجاح

### علامات النجاح:
✅ بعد الموافقة على Google، تُعاد التوجيه إلى:
   ```
   https://brandstore-lyart.vercel.app/
   ```
✅ تظهر بياناتك في الـ header (اسمك/إيميلك)
✅ لا تعود لصفحة Login

### علامات الفشل:
❌ تعود لصفحة `/auth/login`
❌ تظهر رسالة خطأ "redirect_uri_mismatch"
❌ URL في المتصفح يحتوي على `error=`

---

## إذا لم يعمل

### 1. افحص Vercel Logs
```bash
vercel logs https://brandstore-lyart.vercel.app --follow
```

ابحث عن:
- `❌ Error in signIn callback`
- `redirect_uri_mismatch`

### 2. افحص Environment Variables بعد Deploy
```bash
vercel env ls production
```

تأكد من وجود:
```
NEXTAUTH_URL=https://brandstore-lyart.vercel.app
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. افحص Browser Console (F12)
انظر في Console و Network tabs:
- ابحث عن أخطاء حمراء
- افحص request لـ `/api/auth/callback/google`

### 4. مسح Cache
```javascript
// في browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## ملخص سريع (TL;DR)

```bash
# 1. حدّث NEXTAUTH_URL في Vercel:
#    Settings > Environment Variables
#    NEXTAUTH_URL = https://brandstore-lyart.vercel.app

# 2. أضف redirect URL في Google Console:
#    https://brandstore-lyart.vercel.app/api/auth/callback/google

# 3. Redeploy على Vercel:
git commit --allow-empty -m "Fix OAuth"
git push origin main

# 4. انتظر 2-3 دقائق
# 5. جرّب: https://brandstore-lyart.vercel.app/auth/login
```

---

## إذا تستخدم Custom Domain (remostor.net)

إذا كنت تستخدم نطاق مخصص:

### في Vercel:
```env
NEXTAUTH_URL=https://www.remostor.net
```

### في Google Console:
أضف:
```
https://www.remostor.net/api/auth/callback/google
```

---

## الأمان

⚠️ **لا تشارك أبداً:**
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`

✅ **احفظها في:**
- Vercel Environment Variables فقط
- لا تضعها في الكود أو GitHub

---

## المساعدة

إذا استمرت المشكلة:
1. راجع `GOOGLE_OAUTH_FIX.md` للحل الشامل
2. افحص Vercel logs
3. تأكد من Redirect URLs في Google Console
4. تأكد من Redeploy بعد تحديث Environment Variables

---

**آخر تحديث**: 7 فبراير 2026  
**الحالة**: ✅ الكود تم إصلاحه - يحتاج تحديث Vercel Environment Variables فقط  
**الوقت المتوقع**: 5 دقائق ⏱️
