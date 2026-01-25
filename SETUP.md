# دليل الإعداد السريع - Quick Setup Guide

## 🚀 البدء السريع

### 1️⃣ إعداد قاعدة البيانات

قبل البدء، تأكد من تثبيت PostgreSQL على جهازك.

#### خيار أ: استخدام Docker (الأسهل)

```bash
# تشغيل PostgreSQL باستخدام Docker
docker run --name ecommerce-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecommerce_db -p 5432:5432 -d postgres

# تحديث .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"
```

#### خيار ب: PostgreSQL المثبت محليًا

1. افتح pgAdmin أو أي أداة PostgreSQL
2. أنشئ قاعدة بيانات جديدة: `ecommerce_db`
3. حدث `.env` بمعلومات الاتصال الصحيحة

### 2️⃣ إعداد المتغيرات البيئية

قم بتحديث ملف `.env`:

```env
# Database
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ecommerce_db?schema=public"

# NextAuth - غير هذا للإنتاج
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI - اختياري (للذكاء الاصطناعي)
OPENAI_API_KEY="sk-..."
```

💡 **لتوليد NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3️⃣ إنشاء قاعدة البيانات

```bash
# توليد Prisma Client
npm run prisma:generate

# إنشاء الجداول
npm run prisma:migrate

# تعبئة البيانات التجريبية (اختياري)
npm run prisma:seed
```

### 4️⃣ تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

## 👤 بيانات الدخول الافتراضية

بعد تشغيل `prisma:seed`:

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|-------------------|--------------|
| مدير النظام | admin@store.com | admin123 |
| موظف توصيل | driver@store.com | delivery123 |

## 🎯 الخطوات التالية

1. **تصفح الموقع**: `http://localhost:3000`
2. **لوحة الإدارة**: `http://localhost:3000/admin`
3. **Prisma Studio**: `npm run prisma:studio`

## 🔧 الأوامر المفيدة

```bash
# تطوير
npm run dev

# بناء المشروع
npm build

# تشغيل الإنتاج
npm start

# Prisma Commands
npm run prisma:generate    # توليد Client
npm run prisma:migrate     # تطبيق Migrations
npm run prisma:studio      # فتح واجهة إدارة البيانات
npm run prisma:seed        # تعبئة بيانات تجريبية

# Linting
npm run lint
```

## ❓ حل المشاكل الشائعة

### مشكلة: "Prisma Client not generated"
```bash
npm run prisma:generate
```

### مشكلة: "Database connection failed"
- تأكد من تشغيل PostgreSQL
- تحقق من معلومات الاتصال في `.env`
- جرب: `psql -U postgres -h localhost`

### مشكلة: "Port 3000 already in use"
```bash
# استخدم port آخر
PORT=3001 npm run dev
```

### مشكلة: "NextAuth configuration error"
- تأكد من وجود `NEXTAUTH_SECRET` في `.env`
- تأكد من `NEXTAUTH_URL` صحيح

## 📚 موارد إضافية

- [توثيق Next.js](https://nextjs.org/docs)
- [توثيق Prisma](https://www.prisma.io/docs)
- [توثيق NextAuth](https://next-auth.js.org/)
- [توثيق Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🎨 التخصيص

### تغيير الألوان
عدل في `src/app/globals.css`:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### إضافة صفحات جديدة
```bash
# مثال: صفحة About
mkdir src/app/about
touch src/app/about/page.tsx
```

## 🚀 النشر

### Vercel (موصى به)

1. قم برفع المشروع على GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. استورد المشروع
4. أضف متغيرات البيئة
5. انشر!

### متغيرات البيئة للإنتاج
تأكد من إضافة:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY` (اختياري)

---

**مبروك! 🎉 متجرك الإلكتروني جاهز للعمل**
