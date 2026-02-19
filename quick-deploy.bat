@echo off
echo =======================================
echo    Deploying to Vercel...
echo =======================================
echo.

cd /d D:\markting

echo [1/3] Adding files to Git...
git add .

echo [2/3] Creating commit...
git commit -m "🔧 Fix bundle products auto-select + delivery fee display"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    ✅ Deployment Successful!
echo ========================================
echo.
echo 🔗 Vercel Dashboard:
echo    https://vercel.com/akramer2025-devs-projects/brandstore
echo.
echo 🌐 Website:
echo    https://www.remostore.net
echo.
echo ⏳ Wait 2-3 minutes for Vercel to build...
echo.
echo ========================================
