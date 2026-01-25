# دليل رفع المتجر على Vercel 🚀

## لماذا Vercel؟
- ✅ **مجاني** للمشاريع الشخصية
- ✅ متخصص في Next.js
- ✅ رفع بنقرة واحدة
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ تحديث تلقائي عند Push

---

## الطريقة 1: رفع مباشر من GitHub (الأسهل) ⭐

### الخطوة 1: رفع المشروع على GitHub

#### أ. إنشاء Repository جديد:
```bash
# 1. افتح terminal في مجلد المشروع
cd D:\markting

# 2. تهيئة Git (إذا لم يكن موجود)
git init

# 3. إضافة كل الملفات
git add .

# 4. عمل Commit
git commit -m "Initial commit - Brand Store E-commerce"

# 5. اذهب إلى GitHub.com وأنشئ repository جديد
# اسمه مثلاً: brand-store

# 6. ربط المشروع بـ GitHub
git remote add origin https://github.com/YOUR_USERNAME/brand-store.git

# 7. رفع الكود
git branch -M main
git push -u origin main
```

### الخطوة 2: الربط مع Vercel

1. **اذهب إلى:** https://vercel.com
2. **سجل دخول** بحساب GitHub
3. **اضغط "New Project"**
4. **اختر repository** الخاص بك: `brand-store`
5. **اضغط "Import"**

### الخطوة 3: إعدادات البيئة (Environment Variables)

في صفحة الإعدادات، أضف:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="https://your-app-name.vercel.app"

# OpenAI (اختياري)
OPENAI_API_KEY="sk-proj-your-key"
```

**مهم:** 
- غيّر `DATABASE_URL` إلى قاعدة بيانات خارجية (شرح أدناه)
- ولّد `NEXTAUTH_SECRET` جديد: `openssl rand -base64 32`

### الخطوة 4: Deploy!

اضغط **"Deploy"** وانتظر 2-3 دقائق ✅

الموقع سيكون متاح على: `https://your-app-name.vercel.app`

---

## الطريقة 2: رفع مباشر بدون GitHub

### 1. تثبيت Vercel CLI:
```bash
npm install -g vercel
```

### 2. تسجيل الدخول:
```bash
vercel login
```

### 3. رفع المشروع:
```bash
cd D:\markting
vercel
```

### 4. اتبع التعليمات:
- Set up and deploy? **Yes**
- Which scope? اختر حسابك
- Link to existing project? **No**
- What's your project's name? **brand-store**
- In which directory? **./** (اترك فارغ)
- Want to override settings? **No**

### 5. انتظر الرفع:
سيعطيك رابط مباشر مثل: `https://brand-store-abc123.vercel.app`

---

## قاعدة البيانات للإنتاج 🗄️

SQLite **لا يعمل** على Vercel. تحتاج قاعدة بيانات خارجية:

### الخيار 1: Neon (PostgreSQL مجاني) ⭐ الأفضل

1. **اذهب إلى:** https://neon.tech
2. **سجل دخول** بحساب GitHub
3. **أنشئ مشروع** جديد
4. **انسخ Connection String:**
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/database
   ```
5. **أضفه في Vercel** كـ `DATABASE_URL`

### الخيار 2: Supabase (PostgreSQL مجاني)

1. **اذهب إلى:** https://supabase.com
2. **أنشئ مشروع** جديد
3. **اذهب إلى Settings → Database**
4. **انسخ Connection String** (Pooling)
5. **أضفه في Vercel**

### الخيار 3: PlanetScale (MySQL مجاني)

1. **اذهب إلى:** https://planetscale.com
2. **أنشئ Database** جديد
3. **انسخ Connection String**
4. **عدّل `schema.prisma`:**
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

---

## تحديث Prisma Schema للإنتاج

### 1. غيّر من SQLite إلى PostgreSQL:

في `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // كان sqlite
  url      = env("DATABASE_URL")
}
```

### 2. شغّل Migrations:
```bash
# بعد تغيير DATABASE_URL لقاعدة بيانات Neon/Supabase
npx prisma migrate deploy
npx prisma generate
```

### 3. Seed البيانات (اختياري):
```bash
npx prisma db seed
```

---

## إعدادات إضافية في Vercel

### 1. Build Command:
```bash
npm run build
```

### 2. Output Directory:
```
.next
```

### 3. Install Command:
```bash
npm install
```

### 4. Node Version:
```
18.x
```

---

## خطوات ما بعد النشر

### 1. تفعيل Domain مخصص (اختياري):
```
Settings → Domains → Add Domain
```

### 2. تحسين الأداء:
- Vercel Analytics: مجاني
- Speed Insights: مجاني

### 3. التحديثات التلقائية:
كل مرة تعمل `git push`:
- Vercel يرفع تلقائياً
- تحصل على Preview URL
- يشتغل Production بعد المراجعة

---

## حل المشاكل الشائعة

### مشكلة: Build Failed - Database Error
**الحل:**
- تأكد من `DATABASE_URL` صحيح في Environment Variables
- غيّر من `sqlite` إلى `postgresql` في `schema.prisma`
- شغّل `npx prisma generate` قبل الرفع

### مشكلة: NextAuth Error
**الحل:**
- تأكد من `NEXTAUTH_URL` يطابق رابط Vercel
- تأكد من `NEXTAUTH_SECRET` موجود وطوله 32+ حرف

### مشكلة: Images Not Loading
**الحل:**
أضف في `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
},
```

### مشكلة: Environment Variables Not Working
**الحل:**
- أضفها في Vercel Dashboard → Settings → Environment Variables
- اختر "Production", "Preview", "Development"
- Redeploy بعد الإضافة

---

## ملف `.vercelignore` (اختياري)

أنشئ ملف `.vercelignore`:
```
node_modules
.next
.env.local
.DS_Store
*.log
.vscode
```

---

## Checklist قبل النشر ✅

- [ ] ✅ تغيير `datasource` من `sqlite` إلى `postgresql`
- [ ] ✅ إنشاء قاعدة بيانات على Neon/Supabase
- [ ] ✅ نسخ `DATABASE_URL` وإضافته في Vercel
- [ ] ✅ توليد `NEXTAUTH_SECRET` جديد
- [ ] ✅ تحديث `NEXTAUTH_URL` برابط Vercel
- [ ] ✅ رفع الكود على GitHub
- [ ] ✅ ربط Vercel بـ GitHub
- [ ] ✅ Deploy!

---

## الأوامر المفيدة

```bash
# معاينة محلية قبل النشر
vercel dev

# رفع إلى Preview (للتجربة)
vercel

# رفع إلى Production
vercel --prod

# عرض Logs
vercel logs

# فتح Dashboard
vercel open
```

---

## التكلفة 💰

### Vercel (Free Tier):
- ✅ 100 GB Bandwidth/شهر
- ✅ Unlimited Sites
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ Analytics مجاني

### Neon (Free Tier):
- ✅ 3 Projects
- ✅ 10 GB Storage
- ✅ Unlimited Queries
- ✅ Serverless

**المجموع: 0 جنيه! 🎉**

---

## بعد النشر بنجاح:

موقعك سيكون متاح على:
```
https://brand-store-xyz.vercel.app
```

مع:
- ✅ HTTPS تلقائي
- ✅ سرعة عالية
- ✅ تحديثات تلقائية
- ✅ Monitoring مجاني

---

**🚀 جاهز للنشر؟ اتبع الخطوات أعلاه!**
