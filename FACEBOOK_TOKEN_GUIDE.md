# 🔑 دليل تجديد Facebook Access Token

## المشكلة
```
Error validating access token: Session has expired
```

**السبب**: Facebook Access Tokens ليها مدة صلاحية:
- **Short-lived Token**: ساعة واحدة فقط ⏰
- **Long-lived Token**: 60 يوم 📅
- **Never-expiring Token**: مش موجودة للأسف ❌

---

## ✅ الحل الكامل - خطوة بخطوة

### **خطوة 1: روح على Graph API Explorer**

1. افتح الرابط ده:
   👉 **https://developers.facebook.com/tools/explorer/**

2. في أعلى يمين الصفحة، اختار:
   - **Facebook App**: اختار `brandstore` (ID: 2579002475732579)
   - **User or Page**: اختار User بتاعك

---

### **خطوة 2: Generate New Access Token**

1. اضغط على زر **"Generate Access Token"** (الأزرق)

2. هتطلع نافذة **Permissions**، اختار:
   - ✅ `ads_management` (إدارة الإعلانات)
   - ✅ `ads_read` (قراءة بيانات الإعلانات)
   - ✅ `pages_show_list` (عرض الصفحات)
   - ✅ `pages_read_engagement` (قراءة تفاعل الصفحات)
   - ✅ `business_management` (إدارة البيزنس)
   - ✅ `read_insights` (قراءة الإحصائيات)

3. اضغط **"Generate Access Token"**

4. **انسخ الـ Token** (هيبدأ بـ `EAAWc2Eqq7AO...`)
   - ⚠️ **ده Short-lived Token** (هينتهي بعد ساعة!)

---

### **خطوة 3: تحويل لـ Long-lived Token (60 يوم)**

#### **الطريقة الأولى: استخدام PowerShell Script (الأسهل)**

```powershell
# في PowerShell، اكتب:
cd d:\markting
.\refresh-facebook-token.ps1 -ShortToken "EAAWc2Eqq7AO..."
```

**اكتب الـ Short Token اللي نسخته واضغط Enter**

الـ Script هـ:
- يحوّل الـ Token لـ Long-lived (60 يوم)
- يوريلك الـ Token الجديد
- يسألك لو عاوز يحدث `.env` تلقائياً

---

#### **الطريقة الثانية: يدوياً (Manual)**

1. **استبدل في الرابط ده**:
```
https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=2579002475732579&client_secret=e1212bdd6c9208e178c2835906897a64&fb_exchange_token=[ضع_الـ_Short_Token_هنا]
```

2. **افتح الرابط في المتصفح**

3. **الرد هيبقى كده**:
```json
{
  "access_token": "EAAWc2Eqq7AOBOzy1234567890...",
  "token_type": "bearer",
  "expires_in": 5183999
}
```

4. **انسخ الـ `access_token`** الجديد

5. **حدّث `.env`**:
```bash
# افتح: d:\markting\.env
# حدّث السطر ده:
FACEBOOK_ACCESS_TOKEN="الـ_Token_الجديد_هنا"
```

---

### **خطوة 4: إعادة تشغيل السيرفر**

```powershell
npm run dev
```

---

### **خطوة 5: اختبار الاتصال**

1. افتح: http://localhost:3000/admin/marketing
2. ابحث عن قسم **"اختبار اتصال Facebook API"**
3. اضغط **"اختبار الآن"**
4. لازم يظهر: ✅ **"الاتصال ناجح"**

---

## 🔄 إعداد Auto-Refresh (اختياري)

### **مشكلة**: Long-lived Token بيخلص بعد 60 يوم

### **الحل 1: استخدام System User Token (الأفضل)**

**System User Tokens** بتدوم أطول (مش بتخلص):

1. روح على: **Facebook Business Settings**
   👉 https://business.facebook.com/settings/

2. اختار: **Users** → **System Users**

3. اضغط **"Add"** → اختار **"Admin"** role

4. اضغط **"Generate New Token"**

5. اختار:
   - **App**: brandstore
   - **Permissions**: نفس الـ permissions اللي فوق
   - **Token Expiration**: اختار **"60 days"** أو **"Never expire"**

6. انسخ الـ Token واستخدمه في `.env`

---

### **الحل 2: الفحص الدوري**

عمل Cron Job يفحص الـ Token كل أسبوع ويجدده لو قرب يخلص:

```typescript
// src/lib/facebook-token-checker.ts
export async function checkTokenExpiration() {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  const expiresAt = data.data?.expires_at;
  const daysLeft = (expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24);
  
  if (daysLeft < 7) {
    console.warn(`⚠️  Facebook Token expires in ${daysLeft.toFixed(0)} days!`);
    // إرسال إشعار للـ Admin
  }
}
```

---

## 📋 Troubleshooting

### ❌ **Error: Invalid OAuth access token**
**السبب**: Token غلط أو منتهي
**الحل**: اعمل Generate جديد

### ❌ **Error: Permissions not granted**
**السبب**: Token مفيش عليه Permissions كافية
**الحل**: اعمل Generate جديد مع كل الـ Permissions

### ❌ **Error: App not configured**
**السبب**: App ID أو App Secret غلط
**الحل**: تأكد من القيم في `.env`

---

## 🔐 Security Tips

1. **مش تشير الـ Token على GitHub**: استخدم `.env` دايماً
2. **استخدم Environment Variables** في Production
3. **راجع Permissions**: خد بس اللي محتاجه
4. **Monitor Token Expiration**: اعمل notification قبل ما ينتهي

---

## 🎯 Quick Reference

### **Token Types**:
- **User Access Token**: بيخلص بعد 1-2 ساعات
- **Long-lived User Token**: بيخلص بعد 60 يوم
- **Page Access Token**: بيخلص مع User Token
- **System User Token**: بيدوم أطول (ممكن never expire)

### **Check Token Info**:
```
https://developers.facebook.com/tools/debug/accesstoken/
```

### **Regenerate Token**:
```powershell
.\refresh-facebook-token.ps1 -ShortToken "YOUR_SHORT_TOKEN"
```

---

## ✅ Next Steps

بعد تجديد الـ Token:

1. ✅ Test Facebook integration
2. ✅ Create a campaign
3. ✅ Sync campaign data
4. ✅ Set reminder to refresh before 60 days

---

**💡 Pro Tip**: اعمل reminder في الكاليندر بتاعك كل 50 يوم عشان تجدد الـ Token قبل ما ينتهي!
