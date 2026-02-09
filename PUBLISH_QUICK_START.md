# 🚀 الخطوات السريعة للنشر على Google Play

## ✅ قائمة التحقق:

### 1. إنشاء Keystore (10 دقائق) 🔐
```powershell
# إنشاء مجلد
mkdir android\keystores

# إنشاء Keystore
keytool -genkey -v -keystore android\keystores\remostore-release.keystore -alias remostore -keyalg RSA -keysize 2048 -validity 10000
```
📝 **احفظ كلمة المرور في مكان آمن!**

### 2. إعداد key.properties 📝
```powershell
# نسخ الملف
copy android\key.properties.template android\key.properties

# افتح android\key.properties واملأ:
storePassword=كلمة_المرور_هنا
keyPassword=كلمة_المرور_هنا
```

### 3. بناء AAB (5 دقائق) 📦
```powershell
cd android
.\gradlew clean bundleRelease
```
📁 **الملف:** `android\app\build\outputs\bundle\release\app-release.aab`

### 4. إنشاء حساب Google Play (15 دقيقة) 👤
- ادخل: https://play.google.com/console
- ادفع 25$ (مرة واحدة)
- املأ بيانات المطور

### 5. إنشاء التطبيق (5 دقائق) ➕
- Create app
- App name: `Remo Store`
- Language: `Arabic`
- Type: `App`
- Free: ✅

### 6. رفع AAB (2 دقائق) ⬆️
- Production → Create new release
- Upload `app-release.aab`
- Version: `1.0.0`
- Release notes (عربي)

### 7. Store Listing (15 دقائق) 📝

**Short description:**
```
متجر ملابس عصرية - شحن سريع لكل مصر - الدفع عند الاستلام
```

**Full description:** (شوف GOOGLE_PLAY_PUBLISH.md)

**Screenshots:** محتاج 2-8 صور من التطبيق

**Icon:** 512x512 pixels (استخدم logo.png)

**Category:** Shopping

**Contact:**
- Email: akram.er2025@gmail.com
- Phone: +201555512778
- Website: https://www.remostore.net
- Privacy: https://www.remostore.net/privacy.html ✅

### 8. Content Rating (5 دقائق) ⭐
- Start questionnaire
- Category: Shopping
- أجب بـ No على كل الأسئلة

### 9. Target Audience (2 دقائق) 🎯
- Age: 13+
- Children: No

### 10. Data Safety (10 دقائق) 🔒
- Collect data: Yes
  - Account info ✅
  - Location ✅
  - Purchase history ✅
- Share data: No
- Encryption: Yes

### 11. إرسال للمراجعة (1 دقيقة) ✅
- تأكد كل الأقسام مكتملة
- Send for review
- انتظر 1-7 أيام

---

## 📋 ملفات مهمة:

- ✅ [CREATE_KEYSTORE_GUIDE.md](CREATE_KEYSTORE_GUIDE.md) - دليل إنشاء Keystore
- ✅ [GOOGLE_PLAY_PUBLISH.md](GOOGLE_PLAY_PUBLISH.md) - دليل كامل للنشر
- ✅ [privacy.html](public/privacy.html) - صفحة سياسة الخصوصية
- ✅ `android/key.properties` - إعدادات التوقيع (أنشئه من template)

---

## ⏱️ الوقت الإجمالي: ~1-2 ساعة

---

## 🎯 البدء الآن:

### الخطوة 1:
```powershell
mkdir android\keystores
keytool -genkey -v -keystore android\keystores\remostore-release.keystore -alias remostore -keyalg RSA -keysize 2048 -validity 10000
```

### الخطوة 2:
```powershell
copy android\key.properties.template android\key.properties
notepad android\key.properties
```

### الخطوة 3:
```powershell
cd android
.\gradlew bundleRelease
```

### الخطوة 4:
**رابط الملف:** `android\app\build\outputs\bundle\release\app-release.aab`

ارفعه على Google Play Console!

---

## ⚠️ تذكير:

1. **احتفظ بـ keystore** في Google Drive + USB
2. **سجل كلمات المرور** في مكان آمن
3. **صفحة Privacy Policy** موجودة على `/privacy.html`
4. **Screenshots** - خد من التطبيق بعد ما يشتغل

---

## 📞 دعم:

لو واجهت مشكلة، شوف الملفات:
- CREATE_KEYSTORE_GUIDE.md
- GOOGLE_PLAY_PUBLISH.md

**بالتوفيق! 🎉**
