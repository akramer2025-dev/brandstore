# 🚀 خطوات إعداد Facebook App للـ Messenger Bot

## الوضع الحالي:
✅ أنت الآن في لوحة معلومات التطبيق على Facebook

---

## 📋 الخطوات المطلوبة بالترتيب:

### 1️⃣ إضافة Messenger Product

من الشريط الجانبي:
1. ابحث عن **"Add Products"** أو **"إضافة منتجات"**
2. اختر **"Messenger"**
3. اضغط **"Set Up"** أو **"إعداد"**

**أو:**
- اذهب لـ **Dashboard** → **Add Product** → **Messenger**

---

### 2️⃣ إعداد Access Token

بعد إضافة Messenger:

1. من القائمة الجانبية، اختر:
   ```
   Messenger → Settings
   ```

2. في قسم **"Access Tokens"**:
   - اضغط **"Add or Remove Pages"**
   - سجل دخول Facebook
   - اختر صفحة **"Remo Store"** (أو صفحتك)
   - وافق على الأذونات

3. بعد ربط الصفحة، اضغط **"Generate Token"**

4. ⚠️ **انسخ الـ Token فوراً!** (لن يظهر مرة أخرى)

**الـ Token شكله:**
```
EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 3️⃣ إعداد Webhook

في نفس صفحة **Messenger → Settings**:

1. ابحث عن قسم **"Webhooks"**

2. اضغط **"Add Callback URL"**

3. املأ البيانات:
   ```
   Callback URL: https://www.remostore.net/api/messenger/webhook
   Verify Token: remostore_messenger_2026
   ```

4. اختر **Subscription Fields**:
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **message_deliveries**
   - ✅ **message_reads**

5. اضغط **"Verify and Save"**

⚠️ **مهم:** يجب أن يكون التطبيق متصل بالإنترنت على `https` للتحقق من الـ Webhook

---

### 4️⃣ تحديث ملف .env

افتح `.env` في مشروعك وحدّث:

```env
# قبل:
MESSENGER_PAGE_ACCESS_TOKEN="your_page_access_token_here"

# بعد:
MESSENGER_PAGE_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxxxxxxx"
```

(ضع الـ Token اللي نسخته)

---

### 5️⃣ نشر التطبيق على الإنترنت (Production)

الـ Webhook يجب أن يكون متاح على الإنترنت:

**خيار 1: Vercel (موصى به)**
```bash
# رفع على Vercel
vercel --prod

# أو push to GitHub
git add .
git commit -m "feat: Messenger Bot جاهز"
git push origin main
```

**خيار 2: Netlify**
```bash
netlify deploy --prod
```

**خيار 3: استخدام Domain الموجود**
- رفع الكود على: `https://www.remostore.net`
- تأكد أن الـ API route موجود: `/api/messenger/webhook`

---

### 6️⃣ اختبار الرد التلقائي 🧪

بعد اكتمال الإعداد:

1. افتح صفحتك على Facebook
2. اضغط **"Send Message"**
3. اكتب: `مرحبا`
4. يجب أن يرد البوت فوراً! ✅

**أمثلة اختبار:**
```
أنت: السلام عليكم
البوت: مرحباً بك في ريمو ستور! 👋 [+ أزرار Quick Reply]

أنت: عاوز اشتري ملابس
البوت: 🛍️ تسوق أحدث منتجاتنا! [+ رابط الموقع]

أنت: رقم التواصل
البوت: 📞 01555512778
```

---

## ⚠️ مشاكل محتملة وحلولها:

### ❌ Webhook Verification Failed
**السبب:** الموقع غير متصل أو VERIFY_TOKEN خطأ

**الحل:**
1. تأكد من `.env`:
   ```env
   MESSENGER_VERIFY_TOKEN="remostore_messenger_2026"
   ```
2. تأكد أن الموقع شغال على `https`
3. جرب الـ webhook محلياً بـ ngrok (للتطوير):
   ```bash
   npm install -g ngrok
   ngrok http 3006
   # استخدم الـ URL المؤقت
   ```

### ❌ البوت لا يرد
**السبب:** PAGE_ACCESS_TOKEN خطأ أو منتهي

**الحل:**
1. احصل على token جديد من Facebook
2. حدّث `.env`
3. أعد تشغيل السيرفر:
   ```bash
   npm run dev
   ```

### ❌ "This feature is not available"
**السبب:** الصفحة لم تُربط بالتطبيق

**الحل:**
1. Messenger Settings → Add or Remove Pages
2. اختر صفحتك وامنح الأذونات

---

## 📱 ربط البوت بالموقع (اختياري)

### إضافة زر Messenger في الموقع:

**خيار 1: رابط مباشر**
```tsx
<a href="https://m.me/YOUR_PAGE_ID" 
   className="btn-messenger">
  💬 تواصل عبر Messenger
</a>
```

**خيار 2: Facebook Customer Chat Plugin**
```html
<!-- في الـ layout -->
<script>
  var chatbox = document.getElementById('fb-customer-chat');
  chatbox.setAttribute("page_id", "YOUR_PAGE_ID");
</script>
```

---

## 🎉 النتيجة النهائية:

بعد اكتمال الإعداد:
- ✅ البوت يعمل 24/7 بدون توقف
- ✅ رد تلقائي فوري على كل الرسائل
- ✅ يدعم العربية والإنجليزية
- ✅ أزرار تفاعلية (Quick Replies)
- ✅ يوفر 80% من وقت خدمة العملاء

---

## 📊 مراقبة أداء البوت:

في لوحة الإدارة:
- [admin/messenger-bot](http://localhost:3006/admin/messenger-bot)
- عرض الإحصائيات
- قائمة الردود
- اختبار البوت

---

## 🔐 أمان وخصوصية:

⚠️ **لا تشارك:**
- `MESSENGER_PAGE_ACCESS_TOKEN`
- `MESSENGER_VERIFY_TOKEN`

✅ **احفظهم في:**
- `.env` (محلي)
- Vercel Environment Variables (production)

---

## 📞 دعم إضافي:

إذا واجهت أي مشكلة:
1. افتح [MESSENGER_BOT_SETUP.md](MESSENGER_BOT_SETUP.md)
2. شوف console logs: `npm run dev`
3. Facebook Messenger Platform Docs: https://developers.facebook.com/docs/messenger-platform

---

**جاهز! 🚀 ابدأ من الخطوة 1 أعلاه**
