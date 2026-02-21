@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo 🎓 تفعيل نظام التدريب التسويقي
echo ═══════════════════════════════════════════════════════
echo.

echo 📋 الخطوة 1: إيقاف Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 📦 الخطوة 2: تحديث Prisma Schema...
call npx prisma db push --skip-generate

echo.
echo 🔧 الخطوة 3: توليد Prisma Client...
call npx prisma generate

echo.
echo 📚 الخطوة 4: إضافة المحتوى التدريبي...
call npx tsx add-marketing-training-data.ts

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ تم تفعيل نظام التدريب بنجاح!
echo ═══════════════════════════════════════════════════════
echo.
echo 📖 المحتوى المضاف:
echo    ✓ 1 محاضرة (مقدمة التسويق الإلكتروني)
echo    ✓ 2 واجب تطبيقي
echo    ✓ 7 أسئلة اختبار
echo    ✓ 1 مثال SWOT Analysis
echo    ✓ 1 مثال Marketing Funnel
echo.
echo 🚀 الخطوات التالية:
echo    1. راجع التوثيق: MARKETING_TRAINING_SYSTEM.md
echo    2. افتح Prisma Studio: npx prisma studio
echo    3. ابني صفحات التدريب Frontend
echo.
echo 📚 الصفحات المخطط لها:
echo    • /marketing-staff/training
echo    • /marketing-staff/training/lectures
echo    • /marketing-staff/training/assignments
echo    • /marketing-staff/tools/swot
echo    • /marketing-staff/tools/funnel
echo.
pause
