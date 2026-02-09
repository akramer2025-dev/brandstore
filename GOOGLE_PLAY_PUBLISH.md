# 🚀 دليل رفع Remo Store على Google Play

## 📋 المتطلبات:
- ✅ حساب Google Play Console (25$ رسوم مرة واحدة)
- ✅ Android Studio مثبت
- ✅ Java JDK مثبت

---

## الخطوة 1️⃣: إنشاء Keystore (مفتاح التوقيع)

### في Terminal اكتب:

```bash
# إنشاء مجلد للمفاتيح
mkdir android/keystores

# إنشاء keystore جديد
keytool -genkey -v -keystore android/keystores/remostore-release.keystore -alias remostore -keyalg RSA -keysize 2048 -validity 10000
```

**هتسألك أسئلة - اكتب:**
- Password: `اختار password قوي واحفظه` ⚠️ **مهم جداً!**
- Re-enter password: `نفس الـ password`
- First and last name: `Remo Store`
- Organizational unit: `E-Commerce`
- Organization: `Remo Store`
- City: `Cairo`
- State: `Cairo`
- Country code: `EG`
- Is this correct? `yes`
- Key password: `اضغط Enter` (نفس الـ keystore password)

---

## الخطوة 2️⃣: إعداد Gradle للتوقيع

### أنشئ ملف: `android/key.properties`

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=remostore
storeFile=keystores/remostore-release.keystore
```

**⚠️ مهم:** استبدل `YOUR_KEYSTORE_PASSWORD` بالـ password اللي اخترته

---

## الخطوة 3️⃣: تحديث build.gradle

ملف `android/app/build.gradle` محتاج تعديل (سنفعله تلقائياً)

---

## الخطوة 4️⃣: بناء AAB (Android App Bundle)

```bash
cd android
./gradlew bundleRelease
```

**الملف النهائي:**
`android/app/build/outputs/bundle/release/app-release.aab`

---

## الخطوة 5️⃣: إنشاء حساب Google Play Console

1. اذهب إلى: https://play.google.com/console
2. سجل دخول بحساب Google
3. ادفع 25$ رسوم التسجيل (مرة واحدة)
4. املأ بيانات المطور

---

## الخطوة 6️⃣: إنشاء التطبيق

في Google Play Console:

1. **Create app**
2. املأ البيانات:
   - App name: `Remo Store`
   - Default language: `Arabic`
   - App or Game: `App`
   - Free or Paid: `Free`
   - Accept declarations ✅

---

## الخطوة 7️⃣: رفع AAB

1. اذهب إلى: **Production** → **Create new release**
2. **Upload** → اختار ملف `app-release.aab`
3. **Release name**: `1.0.0`
4. **Release notes** (بالعربي):
   ```
   النسخة الأولى من تطبيق ريمو ستور
   - تسوق ملابس عصرية
   - متابعة الطلبات
   - الدفع عند الاستلام
   - خدمة عملاء مميزة
   ```
5. **Save** → **Review release**

---

## الخطوة 8️⃣: ملء معلومات التطبيق

### Store Listing (صفحة المتجر):

**App name:** Remo Store - ريمو ستور

**Short description (80 حرف):**
```
متجر ملابس عصرية - شحن سريع لكل مصر - الدفع عند الاستلام
```

**Full description:**
```
ريمو ستور - وجهتك الأولى للملابس العصرية في مصر! 👔

🛍️ تسوق أحدث صيحات الموضة
📦 شحن مجاني للطلبات أكثر من 1000 جنيه
💰 الدفع عند الاستلام متاح
🚚 توصيل سريع لجميع المحافظات
📱 متابعة طلبك لحظياً
💬 خدمة عملاء مميزة

مميزات التطبيق:
✅ تصفح آلاف المنتجات
✅ فلترة حسب الفئة والسعر
✅ سلة مشتريات ذكية
✅ تتبع الطلبات
✅ عروض وخصومات حصرية

حمل التطبيق دلوقتي واستمتع بتجربة تسوق مميزة! 🎉
```

**App icon:** استخدم logo.png (512x512 pixels)

**Feature graphic:** احتاج صورة بانر (1024x500 pixels)

**Screenshots:**
- محتاج على الأقل 2 screenshots
- مقاس: 1080x1920 (عمودي) أو 1920x1080 (أفقي)

**Category:**
- Application type: `Shopping`
- Category: `Shopping`

**Contact details:**
- Email: `akram.er2025@gmail.com`
- Phone: `+201555512778` (اختياري)
- Website: `https://www.remostore.net`

**Privacy policy:** (مهم!)
```
https://www.remostore.net/privacy
```
(لازم تنشئ صفحة privacy على الموقع)

---

## الخطوة 9️⃣: Content Rating

1. **Start questionnaire**
2. **Category:** Shopping
3. أجب على الأسئلة بـ NO (لا يحتوي محتوى حساس)
4. **Submit**

---

## الخطوة 🔟: Target Audience

1. **Target age:** 13+ (Teen)
2. **Appeal to children:** No
3. **Save**

---

## الخطوة 1️⃣1️⃣: News apps (إذا طُلب)

- **Is this a news app?** No

---

## الخطوة 1️⃣2️⃣: COVID-19 Contact Tracing

- **Is this a contact tracing app?** No

---

## الخطوة 1️⃣3️⃣: Data Safety

ملء استبيان خصوصية البيانات:

**Does your app collect data?** Yes
- User account info (email, name)
- Location (shipping address)
- Purchase history

**Is data shared?** No

**Submit**

---

## الخطوة 1️⃣4️⃣: App Access

- **All functionality available without restrictions?** Yes

---

## الخطوة 1️⃣5️⃣: Ads

- **Does your app contain ads?** No (أو Yes إذا كان فيه إعلانات)

---

## الخطوة 1️⃣6️⃣: مراجعة وإرسال

1. تأكد من تعبئة كل الأقسام ✅
2. **Send for review**
3. انتظر من 1-7 أيام للمراجعة

---

## 📱 بعد الموافقة:

سيكون التطبيق متاح على:
```
https://play.google.com/store/apps/details?id=com.remostore.app
```

---

## 🔄 تحديث التطبيق (لاحقاً):

عند التحديث:
1. زود `versionCode` و `versionName` في `build.gradle`
2. ابني AAB جديد
3. ارفعه في **Production** → **Create new release**
4. اكتب Release notes بالتحديثات

---

## ⚠️ نصائح مهمة:

1. **احتفظ بـ keystore في مكان آمن!** 🔐
   - لو ضاع، مش هتقدر تحدث التطبيق أبداً!
   - اعمل backup على Google Drive أو USB

2. **صفحة Privacy Policy:**
   - لازم تكون موجودة على الموقع
   - استخدم generator: https://app-privacy-policy-generator.nisrulz.com/

3. **Screenshots:**
   - خد screenshots من التطبيق بعد ما يشتغل
   - استخدم أداة: https://hotpot.ai/mockup-generator

4. **Testing:**
   - جرب التطبيق كويس قبل النشر
   - اختبر على أجهزة مختلفة

5. **ASO (App Store Optimization):**
   - استخدم keywords في الوصف
   - حدث Screenshots بانتظام

---

## 📞 دعم:

لو واجهت مشكلة:
- Google Play Console Help: https://support.google.com/googleplay/android-developer
- مجتمع المطورين: https://www.reddit.com/r/androiddev/

---

**بالتوفيق! 🚀**
