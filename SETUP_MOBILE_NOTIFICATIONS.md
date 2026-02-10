# 📱 دليل ربط الإشعارات - تطبيق Remo Store

## ✅ ما تم إنجازه للتو:
- ✅ تثبيت @capacitor/push-notifications  
- ✅ إنشاء NotificationManager.ts لإدارة الإشعارات
- ✅ إضافة MobileNotifications component
- ✅ إضافة API: /api/notifications/register-device
- ✅ مزامنة مع Android ✅

---

## 🔥 الخطوة القادمة: إعداد Firebase

### 1. إنشاء مشروع Firebase
1. اذهب: https://console.firebase.google.com/
2. **Add project** → اسم: `Remo Store`
3. اتبع الخطوات

### 2. إضافة Android App
1. اضغط Android icon
2. **Package name**: `com.remostore.app` ⚠️ مهم!
3. **App nickname**: `Remo Store`
4. Register app

### 3. تحميل google-services.json
1. حمل الملف من Firebase
2. ضعه في:
   ```
   android\app\google-services.json
   ```

⚠️ **موقع الملف مهم جداً!**

---

## 🎯 بعد وضع google-services.json:

```powershell
# مزامنة
npx cap sync android

# بناء التطبيق
cd android
.\gradlew assembleDebug
```

---

## 🧪 اختبار الإشعارات

### من Firebase Console:
1. Cloud Messaging → **Send your first message**
2. العنوان: `مرحباً من ريمو ستور! 👋`
3. النص: `أول إشعار من التطبيق 🎉`
4. **Send test message**
5. استخدم الـ token من console logs

---

## 📝 إرسال إشعارات من السيرفر

```typescript
// مثال: إشعار طلب جديد
await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': `key=${FIREBASE_SERVER_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: userToken,
    notification: {
      title: '🎉 طلب جديد!',
      body: 'تم استلام طلبك بنجاح',
    },
    data: {
      type: 'order',
      orderId: '12345'
    }
  })
})
```

---

## 🎬 كيف تعمل:

1. **عند فتح التطبيق:**
   - يطلب إذن الإشعارات
   - يسجل الجهاز ويحصل على token
   - يرسل الـ token للسيرفر

2. **عند إرسال إشعار:**
   - السيرفر يستخدم Firebase API
   - يرسل للـ token المحفوظ
   - التطبيق يعرض الإشعار

3. **عند الضغط على الإشعار:**
   - التطبيق يفتح
   - ينتقل للصفحة المناسبة

---

## ⚠️ مهم:

- **google-services.json** مطلوب للإشعارات
- حفظ **Server Key** في `.env`
- لا ترفع المفاتيح على Git

---

## 🎉 النتيجة:

بعد إعداد Firebase وإعادة بناء التطبيق:
- الإشعارات تعمل تلقائياً ✅
- يمكنك إرسال إشعارات من السيرفر ✅
- المستخدم يستقبلها على موبايله ✅

---

**الخطوة التالية:** إنشاء مشروع Firebase وتحميل `google-services.json`! 🚀
