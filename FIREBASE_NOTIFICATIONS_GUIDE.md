# 🔔 Firebase Push Notifications - دليل كامل

تم تجهيز نظام الإشعارات بالكامل لتطبيق Remostore الموبايل باستخدام Firebase Cloud Messaging (FCM).

---

## ✅ ما تم إنجازه

### 1️⃣ **Firebase Setup**
- ✅ إنشاء Firebase Project: `remo-store-60575`
- ✅ إضافة Android App بـ package name: `com.remostore.app`
- ✅ تحميل `google-services.json` ووضعه في: `android/app/`
- ✅ إضافة Firebase Admin SDK credentials في `.env`

### 2️⃣ **Android App Configuration**
- ✅ إضافة Firebase Messaging dependencies في `android/app/build.gradle`
- ✅ إضافة Google Services plugin
- ✅ تثبيت `@capacitor/push-notifications` plugin
- ✅ Sync و Build التطبيق بنجاح

### 3️⃣ **Database Schema**
- ✅ إضافة `FCMDeviceToken` model في Prisma
- ✅ تحديث User model مع علاقة `fcmDeviceTokens`
- ✅ تنفيذ migration: `npx prisma db push`

### 4️⃣ **Backend API**
- ✅ `/api/notifications/register-device` - لحفظ FCM tokens
- ✅ `/api/notifications/send` - لإرسال إشعارات من Admin
- ✅ Firebase Admin SDK في `src/lib/firebase-admin.ts`

### 5️⃣ **Frontend Implementation**
- ✅ NotificationManager في `src/lib/notification-manager.ts`
- ✅ MobileNotifications component - يهيئ الإشعارات تلقائياً
- ✅ Admin Dashboard في `/admin/send-notifications`

---

## 📱 كيفية العمل

### على التطبيق الموبايل:

1. **لما المستخدم يفتح التطبيق:**
   - `MobileNotifications` component بيشتغل تلقائياً
   - بيطلب إذن الإشعارات من المستخدم
   - لما المستخدم يوافق، بياخد FCM Token

2. **حفظ الـ Token:**
   - الـ token بيتبعت للـ backend: `/api/notifications/register-device`
   - بيتحفظ في جدول `fcm_device_tokens`
   - بيتربط بالمستخدم لو مسجل دخول

3. **استلام الإشعارات:**
   - **التطبيق مفتوح:** بيظهر in-app notification
   - **التطبيق مقفول:** بيظهر في notification tray
   - **الضغط على الإشعار:** بيفتح التطبيق ويروح للصفحة المناسبة

---

## 🚀 إرسال إشعارات

### من Admin Dashboard:

1. افتح: http://localhost:3001/admin/send-notifications
2. املا:
   - **عنوان الإشعار** (50 حرف)
   - **محتوى الإشعار** (150 حرف)
   - **صورة** (اختياري)
   - **بيانات JSON** (اختياري) - مثال:
     ```json
     {
       "type": "order",
       "orderId": "123",
       "action": "view_order"
     }
     ```
3. اضغط **إرسال الإشعار**

### برمجياً (من Backend):

```typescript
// في أي API route
import { messaging } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

// جلب tokens لمستخدمين معينين
const tokens = await prisma.fCMDeviceToken.findMany({
  where: { 
    userId: { in: ['user1', 'user2'] },
    isActive: true 
  },
  select: { token: true }
});

// إرسال الإشعار
const response = await messaging.sendEachForMulticast({
  notification: {
    title: 'طلبك في الطريق! 🚚',
    body: 'سيصل خلال 30 دقيقة',
  },
  data: {
    type: 'order',
    orderId: '12345',
  },
  tokens: tokens.map(t => t.token)
});

console.log(`✅ نجح: ${response.successCount}`);
console.log(`❌ فشل: ${response.failureCount}`);
```

---

## 🔧 Environment Variables

في ملف `.env`:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID="remo-store-60575"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@remo-store-60575.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 📊 Database Schema

```prisma
model FCMDeviceToken {
  id              String   @id @default(cuid())
  userId          String?  // مستخدم مسجل (اختياري)
  token           String   @unique // FCM registration token
  platform        String   // android أو ios
  deviceInfo      Json?    // معلومات الجهاز
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  lastUsedAt      DateTime @default(now())
  
  user            User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("fcm_device_tokens")
}
```

---

## 🎯 سيناريوهات الاستخدام

### 1. إشعار طلب جديد:
```typescript
{
  title: "طلب جديد! 🛍️",
  body: "طلب #1234 تم تأكيده بنجاح",
  data: {
    type: "order",
    orderId: "1234",
    action: "view_order"
  }
}
```

### 2. إشعار شحنة:
```typescript
{
  title: "طلبك في الطريق! 🚚",
  body: "سيصل خلال 30 دقيقة",
  data: {
    type: "delivery",
    orderId: "1234",
    trackingNumber: "TRK123"
  }
}
```

### 3. إشعار عرض خاص:
```typescript
{
  title: "عرض خاص! 🎉",
  body: "خصم 50% على جميع المنتجات لمدة 24 ساعة",
  image: "https://example.com/offer.jpg",
  data: {
    type: "promotion",
    couponCode: "SAVE50"
  }
}
```

### 4. إشعار رسالة جديدة:
```typescript
{
  title: "رسالة جديدة 💬",
  body: "لديك رد من خدمة العملاء",
  data: {
    type: "message",
    conversationId: "conv123"
  }
}
```

---

## 🧪 اختبار النظام

### على التطبيق:

1. **افتح التطبيق على emulator:**
   ```bash
   cd android
   gradlew installDebug
   adb shell am start -n com.remostore.app/.MainActivity
   ```

2. **راقب الـ logs:**
   ```bash
   adb logcat | grep -E "Firebase|PushNotifications|FCM"
   ```

3. **تأكد من التسجيل:**
   - شوف console logs: "✅ تم التسجيل! Token: ..."

### من Admin Dashboard:

1. افتح: http://localhost:3001/admin/send-notifications
2. اكتب إشعار تجريبي
3. اضغط إرسال
4. شوف الإشعار على الموبايل!

---

## 📁 الملفات المهمة

### Backend:
- `src/lib/firebase-admin.ts` - Firebase Admin SDK
- `src/app/api/notifications/register-device/route.ts` - حفظ tokens
- `src/app/api/notifications/send/route.ts` - إرسال إشعارات
- `prisma/schema.prisma` - Database schema

### Frontend:
- `src/lib/notification-manager.ts` - إدارة الإشعارات
- `src/components/MobileNotifications.tsx` - Auto-initialization
- `src/app/admin/send-notifications/page.tsx` - Admin UI

### Android:
- `android/app/google-services.json` - Firebase config
- `android/app/build.gradle` - Dependencies
- `capacitor.config.ts` - Capacitor config

---

## 🚨 Troubleshooting

### الإشعارات مش واصلة؟

1. **تأكد من Firebase setup:**
   ```bash
   # في console.log لازم تظهر:
   ✅ Firebase Admin initialized
   ```

2. **تأكد من Token موجود:**
   ```sql
   SELECT * FROM fcm_device_tokens WHERE isActive = true;
   ```

3. **تأكد من permissions:**
   - التطبيق لازم ياخد إذن الإشعارات من المستخدم

4. **شوف الـ logs:**
   ```bash
   adb logcat -d | grep -i "firebase\|fcm\|notification"
   ```

### Firebase Admin Error?

```typescript
// تأكد من الـ private key format صح
// لازم يكون: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// مش: "-----BEGIN PRIVATE KEY-----
// ...
// -----END PRIVATE KEY-----"
```

---

## 🎉 الخلاصة

✅ **النظام كامل وجاهز للاستخدام!**

- التطبيق بيستلم إشعارات بنجاح
- Firebase شغال بدون مشاكل
- Admin Dashboard جاهز لإرسال الإشعارات
- Database بيحفظ tokens وسجل الإشعارات

---

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 🔐 Security Notes

⚠️ **مهم جداً:**
- الـ `google-services.json` فيه بيانات حساسة
- الـ `FIREBASE_PRIVATE_KEY` في `.env` سري جداً
- **لا تشير** هذه الملفات في Git
- أضفهم في `.gitignore`

```gitignore
# .gitignore
.env
.env.local
android/app/google-services.json
```

---

**تم بحمد الله! 🎊**

نظام الإشعارات جاهز وشغال 100%!
