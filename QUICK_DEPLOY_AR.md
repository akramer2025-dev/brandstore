# 🚀 خطوات رفع brandstore.com - دليل سريع

## ⏱️ الوقت المتوقع: 15-20 دقيقة

---

## الخطوة 1: حضّر المشروع (دقيقتان)

### في PowerShell:

```powershell
cd D:\markting

# نظف المشروع
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue

# تأكد من Git
git status

# إضافة الملفات
git add .

# Commit
git commit -m "🚀 Ready for production - BrandStore"
```

---

## الخطوة 2: ارفع على GitHub (5 دقائق)

### أ. إنشاء Repository:

1. اذهب: https://github.com/new
2. اسم الـ repo: **brandstore**
3. خليه **Private** (للأمان)
4. اضغط **Create repository**

### ب. Push الكود:

```powershell
# بدّل YOUR_USERNAME باسم حسابك
git remote add origin https://github.com/YOUR_USERNAME/brandstore.git

# Push
git branch -M main
git push -u origin main
```

✅ **Done!** الكود على GitHub

---

## الخطوة 3: Deploy على Vercel (5 دقائق)

### أ. سجل في Vercel:

1. اذهب: https://vercel.com
2. اضغط **Sign Up with GitHub**
3. وافق على الأذونات

### ب. Import المشروع:

1. اضغط **Add New...** → **Project**
2. اختر repository: **brandstore**
3. اضغط **Import**

### ج. Configure:

**Framework Preset:** Next.js ✅ (يتحدد تلقائي)

**Build Settings:**
- Build Command: `prisma generate && next build` ✅
- Output Directory: `.next` ✅

### د. Environment Variables - مهم جداً! 🔐

اضغط **Add Environment Variable** وأضف:

#### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 2. NEXTAUTH_SECRET
```
dPJmbxjVNQHfR03jS22yl9jVY2DOsiQQmSHBJv/xZms=
```

#### 3. NEXTAUTH_URL
```
https://brandstore-[your-project].vercel.app
```
> **ملاحظة:** غيّرها للدومين الفعلي بعد الربط

#### 4. OPENAI_API_KEY (اختياري)
```
your-key-here
```

### هـ. Deploy!

اضغط **Deploy** وانتظر 2-3 دقائق ⏳

✅ **تم!** الموقع الآن على:
```
https://brandstore-[random].vercel.app
```

---

## الخطوة 4: ربط Domain (brandstore.com) - 10 دقائق

### أ. في Vercel:

1. اذهب لمشروعك → **Settings** → **Domains**
2. أضف: `brandstore.com`
3. أضف: `www.brandstore.com`
4. احتفظ بمعلومات DNS اللي هتظهر

### ب. في مزود الـ Domain (Namecheap/GoDaddy):

#### إذا كان Namecheap:

1. اذهب: Dashboard → Domain List → Manage
2. Advanced DNS → Add New Record

**السجل الأول (A Record):**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**السجل الثاني (CNAME):**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

#### إذا كان GoDaddy:

1. My Products → Domains → DNS
2. أضف نفس السجلات

### ج. انتظر (5-30 دقيقة):

DNS ياخد وقت للانتشار. جرب الموقع كل شوية:
```
https://brandstore.com
```

✅ **SSL** يتفعل تلقائياً من Vercel!

---

## الخطوة 5: تحديث NEXTAUTH_URL

بعد ما الـ domain يشتغل:

1. Vercel → Settings → Environment Variables
2. غيّر `NEXTAUTH_URL` لـ:
   ```
   https://brandstore.com
   ```
3. Save
4. Deployments → اضغط على آخر deployment → **Redeploy**

---

## الخطوة 6: اختبر كل شيء! ✅

جرب على الموقع:

- [ ] الصفحة الرئيسية تفتح
- [ ] تسجيل دخول يشتغل
- [ ] إضافة منتج للسلة
- [ ] إنشاء طلب
- [ ] لوحة الإدارة: `https://brandstore.com/admin`
- [ ] لوحة الشريك: `https://brandstore.com/vendor`
- [ ] الصور تظهر

---

## 🎉 مبروك! موقعك شغال!

### المواقع المفيدة:

- **موقعك:** https://brandstore.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech
- **GitHub Repo:** https://github.com/YOUR_USERNAME/brandstore

### التحديثات المستقبلية:

```powershell
# عدّل الكود
# ثم:
git add .
git commit -m "Update: وصف التعديل"
git push

# Vercel ينشر تلقائياً! 🚀
```

---

## 🆘 مشاكل شائعة

### "Build failed"
- تأكد من Environment Variables صح
- تأكد من `DATABASE_URL` فيه `?sslmode=require`

### "Database connection error"
- تأكد من IP Vercel مسموح في Neon (عادة تلقائي)
- جرب Redeploy

### "Can't login"
- تأكد من `NEXTAUTH_URL` صحيح
- تأكد من `NEXTAUTH_SECRET` موجود

### "Domain not working"
- انتظر 30-60 دقيقة للـ DNS
- تأكد من DNS records صح

---

## 💰 التكاليف

- **Vercel:** 0 ج.م (مجاني)
- **Neon DB:** 0 ج.م (مجاني)
- **Domain:** ~300-500 ج.م/سنة

**المجموع:** 300-500 ج.م فقط سنوياً! 🎉

---

## 📞 محتاج مساعدة؟

أنا هنا! اسأل أي سؤال 💪
