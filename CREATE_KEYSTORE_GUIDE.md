# 🔐 إنشاء Keystore لـ Google Play

## الخطوة 1: إنشاء مجلد للمفاتيح

mkdir android\keystores

## الخطوة 2: إنشاء Keystore

في Terminal/PowerShell:

```powershell
keytool -genkey -v -keystore android\keystores\remostore-release.keystore -alias remostore -keyalg RSA -keysize 2048 -validity 10000
```

## سيسألك:

1. **Enter keystore password:**  
   اكتب كلمة مرور قوية (مثلاً: `Remo@2026#Store`)  
   ⚠️ **احفظها! مهمة جداً**

2. **Re-enter new password:**  
   أعد كتابة نفس كلمة المرور

3. **What is your first and last name?**  
   `Remo Store`

4. **What is the name of your organizational unit?**  
   `E-Commerce`

5. **What is the name of your organization?**  
   `Remo Store`

6. **What is the name of your City or Locality?**  
   `Cairo`

7. **What is the name of your State or Province?**  
   `Cairo`

8. **What is the two-letter country code for this unit?**  
   `EG`

9. **Is CN=Remo Store, OU=E-Commerce... correct?**  
   `yes`

10. **Enter key password for <remostore>**  
    اضغط `Enter` (لاستخدام نفس كلمة مرور الـ keystore)

## الخطوة 3: إعداد key.properties

انسخ الملف:
```powershell
copy android\key.properties.template android\key.properties
```

افتح `android\key.properties` واستبدل:
```properties
storePassword=كلمة_المرور_اللي_اخترتها
keyPassword=كلمة_المرور_اللي_اخترتها
keyAlias=remostore
storeFile=keystores/remostore-release.keystore
```

## الخطوة 4: بناء AAB

```powershell
cd android
.\gradlew bundleRelease
```

## الملف النهائي:
`android\app\build\outputs\bundle\release\app-release.aab`

## ⚠️ مهم جداً:

1. **احتفظ بـ keystore في مكان آمن:**
   - اعمل backup على Google Drive
   - اعمل backup على USB
   - **لو ضاع، لن تستطيع تحديث التطبيق أبداً!**

2. **لا ترفع key.properties على Git:**
   - الملف موجود في `.gitignore`
   - يحتوي على كلمات مرور حساسة

3. **سجل معلومات الـ Keystore:**
   ```
   Keystore Path: android/keystores/remostore-release.keystore
   Keystore Password: _______________
   Key Alias: remostore
   Key Password: _______________
   ```

## 🎉 بعد البناء:

ارفع ملف `app-release.aab` على Google Play Console!
