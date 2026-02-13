# 🚀 دليل نشر الموقع على www.remostore.net

## 📋 قبل النشر - Checklist

### 1️⃣ **تحديث Environment Variables**

في ملف `.env`، غيّر القيم من Development إلى Production:

```bash
# ❌ قبل (Development)
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# ✅ بعد (Production)
NEXTAUTH_URL="https://www.remostore.net"
NEXT_PUBLIC_APP_URL="https://www.remostore.net"
NEXT_PUBLIC_SITE_URL="https://www.remostore.net"
```

### 2️⃣ **Facebook Pixel Configuration**

تأكد إن Facebook Pixel ID موجود:
```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="YOUR_PIXEL_ID_HERE"
```

### 3️⃣ **Database Connection**

✅ **Neon Database** جاهز للـ Production:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🛠️ خطوات النشر

### **Option 1: Vercel (الأسهل والأسرع)**

1. **ربط المشروع بـ Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **إضافة Environment Variables** في Vercel Dashboard:
   - اذهب إلى: `Settings` → `Environment Variables`
   - أضف كل المتغيرات من `.env`

3. **ربط الدومين**:
   - في Vercel Dashboard: `Domains` → `Add Domain`
   - أضف: `www.remostore.net` و `remostore.net`
   - اتبع التعليمات لتحديث DNS Records

4. **Deploy**:
   ```bash
   vercel --prod
   ```

---

### **Option 2: VPS/Cloud Server (More Control)**

#### **A. Build المشروع**:
```bash
npm run build
```

#### **B. تشغيل Production Server**:
```bash
npm run start
```

#### **C. استخدام PM2 لإدارة العملية**:
```bash
npm install -g pm2
pm2 start npm --name "remostore" -- start
pm2 save
pm2 startup
```

#### **D. Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name www.remostore.net remostore.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **E. SSL Certificate (Let's Encrypt)**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d remostore.net -d www.remostore.net
```

---

## 🔐 Security Checklist

- [ ] **NEXTAUTH_SECRET**: استخدم secret قوي ومختلف عن Development
- [ ] **Database**: تأكد من الـ connection آمن (SSL enabled)
- [ ] **API Keys**: خزّن في Environment Variables فقط (مش في الكود)
- [ ] **CORS**: تأكد إن الـ origins محددة صح
- [ ] **Rate Limiting**: فعّل حماية من DDoS
- [ ] **Firewall**: اسمح للـ ports الضرورية بس

---

## 📊 DNS Configuration

### **في Control Panel الخاص بالدومين**:

**A Record**:
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600
```

**CNAME Record** (للـ www):
```
Type: CNAME
Name: www
Value: remostore.net
TTL: 3600
```

**إذا استخدمت Vercel**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 🧪 Testing بعد النشر

### 1. **Test URLs**:
- https://www.remostore.net
- https://remostore.net
- https://www.remostore.net/admin
- https://www.remostore.net/api/health

### 2. **Test Facebook Integration**:
- افتح: https://www.remostore.net/admin/marketing
- اختبر "ربط بفيسبوك"
- تأكد إن الـ Landing Pages بتشتغل

### 3. **Test Facebook Pixel**:
```javascript
// افتح Console في المتصفح
fbq('track', 'PageView');
console.log(_fbq); // لازم يكون موجود
```

### 4. **Test Database**:
- سجّل دخول كـ Admin
- أنشئ منتج جديد
- أنشئ حملة تسويقية

---

## 🚀 Post-Deployment Tasks

### 1. **Facebook Business Manager**:
- روح على: Business Settings
- في **Domains**: أضف `www.remostore.net`
- Verify Domain بـ DNS TXT Record

### 2. **Facebook Ads Manager**:
- حدّث الـ Conversion Events URLs
- أضف Domain للـ Pixel

### 3. **Google Analytics** (اختياري):
- أضف Property جديد
- ركّب GA4 tracking code

### 4. **Monitoring**:
- استخدم Vercel Analytics (إذا على Vercel)
- أو ركّب: Sentry (للـ Error Tracking)

---

## 📝 Environment Variables - Production

```bash
# =====================
# PRODUCTION SETTINGS
# =====================

# Server
PORT=3000

# Database - Neon (Production)
DATABASE_URL=postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_SECRET="[GENERATE_NEW_SECRET_FOR_PRODUCTION]"
NEXTAUTH_URL="https://www.remostore.net"

# App URLs
NEXT_PUBLIC_APP_URL="https://www.remostore.net"
NEXT_PUBLIC_SITE_NAME="RemoStore"
NEXT_PUBLIC_SITE_URL="https://www.remostore.net"

# OpenAI
OPENAI_API_KEY="[YOUR_OPENAI_KEY]"

# Groq API
GROQ_API_KEY="[YOUR_GROQ_KEY]"

# Cloudinary
CLOUDINARY_CLOUD_NAME="disd7lhsd"
CLOUDINARY_API_KEY="771537117787565"
CLOUDINARY_API_SECRET="[YOUR_SECRET]"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="disd7lhsd"

# Facebook Marketing
FACEBOOK_APP_ID="2579002475732579"
FACEBOOK_APP_SECRET="[YOUR_SECRET]"
FACEBOOK_ACCESS_TOKEN="[YOUR_TOKEN]"
FACEBOOK_AD_ACCOUNT_ID="act_1962278932225"
FACEBOOK_PAGE_ID="100063904247982"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="[YOUR_PIXEL_ID]"

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="[YOUR_PUBLIC_KEY]"
VAPID_PRIVATE_KEY="[YOUR_PRIVATE_KEY]"
VAPID_SUBJECT="mailto:admin@remostore.net"

# Bosta Delivery
BOSTA_API_KEY="[YOUR_BOSTA_KEY]"
NEXT_PUBLIC_BOSTA_ENABLED="true"
```

---

## 🔄 Quick Switch Script

عشان تبدل بين Development و Production بسرعة، استخدم:

### **للـ Development**:
```bash
npm run dev
```

### **للـ Production**:
```bash
npm run build
npm run start
```

---

## 📞 Domain Verification

### **Facebook Domain Verification**:
1. روح على: Business Settings → Domains
2. Add Domain: `www.remostore.net`
3. اختار Verification Method: **DNS TXT Record**
4. أضف TXT Record في DNS:
   ```
   Type: TXT
   Name: @
   Value: facebook-domain-verification=[code]
   ```

### **Google Search Console**:
1. أضف Property: `www.remostore.net`
2. Verify بـ DNS TXT أو HTML File

---

## ⚡ Performance Optimization

- [ ] تفعيل Caching في Nginx/Cloudflare
- [ ] Compress Images (Cloudinary auto-optimizes)
- [ ] Enable Gzip/Brotli compression
- [ ] Use CDN (Vercel/Cloudflare)
- [ ] Database Connection Pooling

---

## 🎯 Facebook Campaign URLs

بعد النشر، الـ Landing Pages هتبقى:

- **Homepage**: `https://www.remostore.net`
- **Products**: `https://www.remostore.net/products`
- **Category**: `https://www.remostore.net/products?category=fashion`
- **Single Product**: `https://www.remostore.net/products/[id]`

استخدم UTM Parameters للـ tracking:
```
https://www.remostore.net/products?utm_source=facebook&utm_medium=cpc&utm_campaign=eid-2026
```

---

## ✅ Ready to Deploy?

المطلوب منك:
1. ✅ حدّث `.env` بالـ Production URLs
2. ✅ اختار Platform (Vercel أو VPS)
3. ✅ ركّب SSL Certificate
4. ✅ اضبط DNS Records
5. ✅ Test كل حاجة

---

**🚀 بعد ما تنشر، النظام هيشتغل على www.remostore.net وكل الحملات هتبقى جاهزة للعمل!**
