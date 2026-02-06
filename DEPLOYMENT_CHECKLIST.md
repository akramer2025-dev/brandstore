# ✅ Deployment Checklist - قائمة التحقق قبل النشر

استخدم هذه القائمة **قبل كل deployment** لتجنب المشاكل في Production.

---

## 🔴 Critical - لازم تتأكد منها 100%

### 1. Environment Variables
- [ ] جميع متغيرات `.env` موجودة على Vercel
- [ ] `DATABASE_URL` بدون علامات تنصيص
- [ ] `DATABASE_URL` تنتهي بـ `?sslmode=require`
- [ ] `NEXTAUTH_SECRET` موجود ومش فاضي
- [ ] `NEXTAUTH_URL` = `https://www.remostore.net` (Production)
- [ ] مافيش مسافات قبل/بعد أي متغير

### 2. Database Connection
- [ ] الاتصال بـ Neon Database يعمل
- [ ] Prisma migrations تم تطبيقها كلها: `npx prisma migrate deploy`
- [ ] Database sleep settings مضبوطة (Neon Auto-suspend)

### 3. Local Testing
- [ ] `npm run build` يعمل بنجاح محلياً بدون أخطاء
- [ ] `npm run start` يشتغل والموقع يفتح على http://localhost:3000
- [ ] مافيش errors في Console

---

## 🟡 Important - مهمة جداً

### 4. Features Testing
- [ ] تسجيل الدخول يعمل (Email + Password)
- [ ] Google OAuth يعمل (لو مفعّل)
- [ ] إضافة منتج للسلة يعمل
- [ ] إنشاء طلب جديد يعمل
- [ ] رفع الصور يعمل (Cloudinary)
- [ ] PWA Install يعمل

### 5. API Endpoints
- [ ] `/api/health` يرجع status: "ok"
- [ ] `/api/auth/signin` يعمل
- [ ] `/api/products` يرجع المنتجات
- [ ] `/api/orders` يعمل

### 6. Security
- [ ] API Keys مش موجودة في الكود
- [ ] `.env` مش committed على Git
- [ ] Secrets مش في ملفات markdown
- [ ] Admin routes محمية بـ authentication

---

## 🟢 Optional - اختياري لكن مفيد

### 7. Performance
- [ ] Images محسنة ومضغوطة
- [ ] Lazy loading مفعّل
- [ ] Build size معقول (أقل من 10MB)

### 8. SEO
- [ ] `metadata` موجود في كل page
- [ ] `robots.txt` موجود
- [ ] `sitemap.xml` موجود (اختياري)

### 9. Analytics & Monitoring
- [ ] Vercel Analytics مفعّل (اختياري)
- [ ] Error tracking setup (اختياري)

---

## 🚀 قبل الـ Deploy مباشرة

### Final Checks:
```bash
# 1. تأكد من آخر commit
git log -1

# 2. تأكد من clean build
npm run build

# 3. Push to GitHub
git push origin main

# 4. انتظر Vercel deployment (2-3 دقائق)

# 5. افحص Health Check
# افتح: https://www.remostore.net/api/health
# لازم يرجع: { "status": "ok", "database": "connected" }
```

---

## 🔍 بعد الـ Deploy

### Verification Steps:

1. **افتح الموقع**: https://www.remostore.net
   - [ ] الصفحة الرئيسية تفتح بدون errors
   - [ ] الصور تظهر
   - [ ] القوائم تعمل

2. **افحص Health Check**: https://www.remostore.net/api/health
   - [ ] Status = "ok"
   - [ ] Database = "connected"
   - [ ] مافيش errors في الـ response

3. **افحص Console Logs**:
   - [ ] مافيش errors حمراء في Browser Console
   - [ ] مافيش warnings كتير

4. **Test Critical Features**:
   - [ ] سجل دخول بحساب test
   - [ ] افتح صفحة منتج
   - [ ] ضيف منتج للسلة
   - [ ] جرب إنشاء طلب

5. **Vercel Logs**:
   - [ ] افتح Vercel Dashboard → Deployments → View Logs
   - [ ] تأكد مافيش errors

---

## 🆘 إذا ظهرت مشكلة

### خطوات الحل السريع:

1. **Rollback فوري** (إذا كان ضروري):
   ```bash
   # على Vercel Dashboard:
   # Deployments → اختر آخر deployment ناجح → Promote to Production
   ```

2. **افحص الخطأ**:
   - روح Vercel Logs
   - روح `/api/health`
   - افتح Browser Console

3. **استخدم الأدلة**:
   - [VERCEL_DEBUGGING_GUIDE.md](VERCEL_DEBUGGING_GUIDE.md)
   - [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)

4. **Fix & Redeploy**:
   - صلح المشكلة
   - Test محلياً
   - Deploy تاني

---

## 📊 Monitoring المستمر

### أدوات مفيدة:

1. **UptimeRobot** (مجاني):
   - يراقب الموقع كل 5 دقائق
   - يبعتلك email لو فيه مشكلة
   - https://uptimerobot.com

2. **Vercel Analytics**:
   - Dashboard → Analytics
   - شاهد Real-time visitors

3. **Manual Check**:
   - افتح `/api/health` كل فترة
   - تأكد Status = "ok"

---

## 💼 Best Practices

### للمطورين:

1. **Never commit secrets** - استخدم `.env.local` للتجربة
2. **Test locally first** - دايماً `npm run build` قبل الـ push
3. **Use staging environment** - لو ممكن عمل test deployment الأول
4. **Keep documentation updated** - حدث الأدلة بعد أي تغيير كبير
5. **Monitor production** - استخدم UptimeRobot أو similar
6. **Have rollback plan** - دايماً تعرف ترجع للنسخة القديمة
7. **Communicate** - لو في maintenance، قول للعملاء

### للمشاريع الكبيرة:

- **Staging environment** قبل Production
- **Automated tests** قبل الـ deploy
- **Feature flags** لتجربة features جديدة
- **Blue-Green deployment** لـ zero-downtime
- **Database backups** يومي على الأقل

---

## 🎯 الخلاصة

**قبل أي deployment:**
1. ✅ Check Environment Variables
2. ✅ Test Build Locally  
3. ✅ Push & Wait for Vercel
4. ✅ Test `/api/health`
5. ✅ Test Critical Features

**بعد الـ deployment:**
1. ✅ Monitor for 15-30 minutes
2. ✅ Check Vercel Logs
3. ✅ Test manually if possible

**دايماً تفتكر:** 
> Better safe than sorry! 
> 
> **اختبر كويس قبل ما تنشر! 🚀**
