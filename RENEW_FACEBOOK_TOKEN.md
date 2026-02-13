# 🔄 تجديد Facebook Access Token

## المشكلة
```
Error validating access token: Session has expired
```

هذا الخطأ يعني أن الـ Access Token انتهت صلاحيته ومحتاج تجدده.

---

## الحل السريع (10 دقائق)

### الخطوة 1: روح على Meta for Developers
🔗 [Meta for Developers](https://developers.facebook.com/)

### الخطوة 2: اختار تطبيقك
- اضغط على **My Apps**
- اختار تطبيقك: **RemoStore** (أو أي اسم انت حاططه)

### الخطوة 3: افتح Graph API Explorer
🔗 [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

### الخطوة 4: Generate New Token

1. **اختار التطبيق** من القائمة المنسدلة (Facebook App)
2. **User or Page**: اختار **User Token**
3. اضغط **Generate Access Token**
4. هيطلب منك Permissions - اختار:
   ✅ `ads_management`
   ✅ `ads_read`
   ✅ `business_management`
   ✅ `pages_show_list`
   ✅ `pages_read_engagement`
   ✅ `pages_manage_posts`
   ✅ `pages_manage_metadata`

5. اضغط **Continue** و **Done**

### الخطوة 5: احصل على Long-Lived Token (مهم!)

الـ Token اللي طلع دلوقتي short-lived (بيخلص بعد ساعة).
محتاج تحوله لـ **Long-Lived Token** (بيستمر 60 يوم):

#### الطريقة الأولى: باستخدام Access Token Tool
🔗 [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)

1. الصق الـ Token اللي طلعك
2. اضغط **Debug**
3. هتلاقي زر **Extend Access Token** - اضغط عليه
4. انسخ الـ Token الجديد

#### الطريقة الثانية: باستخدام API Request
افتح المتصفح والصق الـ URL ده (بدل القيم):

```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN
```

بدل:
- `YOUR_APP_ID`: بـ App ID بتاعك (من `.env`: 2579002475732579)
- `YOUR_APP_SECRET`: بـ App Secret (من `.env`: e1212bdd6c9208e178c2835906897a64)
- `YOUR_SHORT_TOKEN`: بالـ Token اللي طلع من Graph API Explorer

هيطلع لك JSON فيها الـ Long-Lived Token:
```json
{
  "access_token": "YOUR_LONG_LIVED_TOKEN",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

### الخطوة 6: حدث ملف .env

افتح ملف `.env` وحدث الـ token:

```env
FACEBOOK_ACCESS_TOKEN="الـ Token الجديد هنا"
```

### الخطوة 7: أعد تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl + C)
npm run dev
```

---

## ✅ التحقق من نجاح التجديد

بعد تجديد الـ Token، جرب تنشئ campaign تاني.
لو نجح، هتشوف:

```
✅ Campaign created: [ID]
✅ AdSet created: [ID]
✅ Ad Creative created: [ID]
✅ Ad created: [ID]
✅ Facebook campaign created successfully!
```

---

## 📋 ملاحظات مهمة

### مدة صلاحية الـ Tokens:

1. **Short-Lived Token** (من Graph API Explorer مباشرة):
   - ⏰ مدته: 1 ساعة
   - ❌ مش مناسب للـ production

2. **Long-Lived User Token** (بعد التحويل):
   - ⏰ مدته: 60 يوم
   - ✅ مناسب للتطوير
   - ⚠️ محتاج تجدده كل شهرين

3. **Page Access Token** (الأفضل):
   - ⏰ مدته: دائم (never expires)
   - ✅ الأفضل للـ production
   - 📌 بنجيبه من `/me/accounts` API

### لو عايز Never-Expiring Token:

1. **احصل على Long-Lived User Token** (الخطوات اللي فوق)
2. **اجلب Page Token** باستخدام:

```bash
# في المتصفح أو Postman:
https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN
```

3. **استخدم الـ `access_token` من الصفحة** (مش الـ User Token)
4. الـ Page Token ده **بيستمر للأبد** طول ما الصفحة موجودة

---

## 🆘 المشاكل الشائعة

### المشكلة: "Invalid OAuth access token"
**الحل**: الـ Token مش صحيح، جدده من أول وجديد

### المشكلة: "This token does not have ads_management permission"
**الحل**: لما تعمل Generate Token، اختار الـ permissions المطلوبة

### المشكلة: "Token will expire soon"
**الحل**: حوله لـ Long-Lived Token

### المشكلة: "Cannot access page"
**الحل**: تأكد إنك Admin أو Editor على الصفحة

---

## 📞 محتاج مساعدة؟

1. **تحقق من الـ Token**:
   🔗 https://developers.facebook.com/tools/debug/accesstoken/

2. **شوف الـ Permissions**:
   - لازم يكون فيها `ads_management`
   - لازم يكون فيها `pages_show_list`

3. **تأكد من الـ Page ID**:
   - الصفحة الصحيحة: `103042954595602` (BRAND STORE)

---

## ✨ نصيحة للمستقبل

عشان ماتحتاجش تجدد الـ Token كل شوية:

1. **استخدم Page Access Token** (never expires)
2. **أعمل System User Token** في Business Manager (أفضل حل للـ production)
3. **فعّل Automated Token Refresh** في التطبيق

---

**جدد الـ Token دلوقتي وجرب تنشئ campaign تاني! 🚀**
