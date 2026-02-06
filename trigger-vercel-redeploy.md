# إعادة نشر الموقع على Vercel

## الطريقة 1: من خلال Vercel Dashboard
1. افتح https://vercel.com/akramer2025-devs-projects
2. اختار المشروع
3. اضغط "Deployments"
4. اضغط على آخر deployment
5. اضغط "Redeploy"

## الطريقة 2: Push فارغ على Git
```bash
git commit --allow-empty -m "trigger: redeploy to clear cache"
git push origin main
```

## الطريقة 3: باستخدام Vercel CLI
```bash
vercel --prod
```

## تنظيف Cache
بعد Redeploy، امسح cache المتصفح:
- Ctrl + Shift + Delete
- أو افتح في Incognito mode
