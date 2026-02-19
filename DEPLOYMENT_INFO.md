# معلومات الـ Deployment

## 🔗 روابط المشروع

### Vercel Dashboard:
https://vercel.com/akramer2025-devs-projects/brandstore

### الموقع المباشر:
https://www.remostore.net

---

## 📋 التحديثات الأخيرة

✅ إصلاح قسم "اشترى العملاء معاً"
✅ إصلاح رسوم التوصيل في السلة
✅ تحديث إعدادات Vercel للمشروع الصحيح

---

## 🚀 لرفع تحديث جديد:

### الطريقة 1 - PowerShell:
```powershell
.\deploy-now.ps1
```

### الطريقة 2 - Batch File:
```
اضغط دبل كليك على: deploy-fix.bat
```

### الطريقة 3 - Manual:
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## ⚠️ إذا الموقع لا يعمل:

1. افتح Vercel Dashboard (الرابط أعلاه)
2. تحقق من حالة آخر Deployment
3. إذا كان Failed أو Error:
   - اضغط على الـ Deployment  
   - اقرأ Build Logs
   - أو اضغط "Redeploy"

4. تأكد من Environment Variables:
   - DATABASE_URL موجود
   - NEXTAUTH_SECRET موجود  
   - NEXTAUTH_URL=https://www.remostore.net

---

## ⏱️ مدة الـ Deployment

عادةً يستغرق **2-3 دقائق** بعد push على GitHub.
