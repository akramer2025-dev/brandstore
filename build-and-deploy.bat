@echo off
echo ========================================
echo   اختبار البناء ثم النشر
echo ========================================
echo.

cd /d D:\markting

echo [1/4] ايقاف Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] اختبار البناء...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   ❌ فشل البناء! لن يتم النشر
    echo ========================================
    pause
    exit /b 1
)

echo.
echo [3/4] البناء نجح! رفع التحديثات...
git add .
git commit -m "✨ Add subcategories dropdown + Fix Next.js 15 params"

echo [4/4] النشر على Vercel...
git push origin main

echo.
echo ========================================
echo   ✅ تم النشر بنجاح!
echo ========================================
echo.
echo 🔗 Vercel: https://vercel.com/akramer2025-devs-projects/brandstore
echo 🌐 الموقع: https://www.remostore.net
echo ⏳ انتظر 2-3 دقائق للبناء...
echo.
pause
