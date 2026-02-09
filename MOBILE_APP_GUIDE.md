# 📱 دليل إعداد تطبيق Remo Store للموبايل

## ✅ ما تم إنجازه:
- ✅ تثبيت Capacitor
- ✅ إنشاء branch منفصل (mobile-app)
- ✅ إضافة منصة Android
- ✅ ربط التطبيق بالسيرفر (www.remostore.net)

## 🎯 الطريقة الآمنة المستخدمة:
التطبيق **لن يؤثر** على الكود الحالي! 
- التطبيق يتصل بـ www.remostore.net مباشرة
- لا يحتاج تغيير في Next.js
- جميع ا��ميزات (NextAuth, API, Database) تعمل بشكل طبيعي

## 📋 الخطوات القادمة:

### 1. تثبيت Android Studio (إذا لم يكن مثبت):
- تحميل من: https://developer.android.com/studio
- تثبيت Android SDK
- تفعيل USB Debugging على الموبايل

### 2. إعداد الأيقونة والشعار:
```bash
# ضع صورة logo بحجم 1024x1024 في:
# android/app/src/main/res/
```

### 3. بناء APK:
```bash
# فتح المشروع في Android Studio
npx cap open android

# أو بناء APK من Terminal
cd android
./gradlew assembleDebug

# ملف APK سيكون في:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. اختبار التطبيق:
```bash
# تشغيل على موبايل متصل
npx cap run android

# أو فتح في Android Studio
npx cap open android
```

### 5. رفع على Google Play:
- إنشاء حساب Google Play Console
- بناء AAB (Android App Bundle) بدل APK
- رفع وملء المعلومات
- نشر التطبيق

## 🔧 Commands المهمة:

```bash
# تحديث التطبيق بعد تغييرات الويب
npx cap sync

# فتح في Android Studio  
npx cap open android

# تشغيل على جهاز
npx cap run android

# بناء APK للتوزيع
cd android && ./gradlew assembleRelease
```

## ⚠️ ملاحظات مهمة:

1. **Testing:**
   - جرب التطبيق أولاً في وضع Debug
   - تأكد من كل المميزات تعمل

2. **Permissions:**
   - خد بالك من الـ Permissions المطلوبة (Camera, Storage, etc)
   - ممكن تعدلها في: `android/app/src/main/AndroidManifest.xml`

3. **Security:**
   - للنشروضع Production، استخدم signed APK/AAB
   - احتفظ بملف الـ Keystore في مكان آمن

4. **Updates:**
   - لما تحدث الموقع، التطبيق هياخد التحديثات تلقائياً
   - لأنه متصل بالسيرفر الحي

## 🎨 تخصيص التطبيق:

### تغيير اسم التطبيق:
```xml
<!-- android/app/src/main/res/values/strings.xml -->
<string name="app_name">متجر ريمو</string>
```

### تغيير الأيقونة:
ضع الصور في:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)  
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Splash Screen:
```xml
<!-- android/app/src/main/res/values/styles.xml -->
تعديل اللون والصورة
```

## 📱 متطلبات النظام:

- ✅ Windows 10/11
- ✅ Node.js 18+
- ✅ Android Studio
- ✅ Java JDK 17+
- ✅ Android SDK

## 🚀 البدء الآن:

1. ثبت Android Studio إذا لم يكن مثبت
2. افتح المشروع:
   ```bash
   npx cap open android
   ```
3. اختبر على جهاز أو Emulator
4. ابني APK

---

**ملاحظة:** التطبيق الحالي آمن تماماً! الموبايل app في branch منفصل وبيستخدم الموقع الحي.
