@echo off
echo ========================================
echo  Brand Store - Deploy to Vercel
echo ========================================
echo.

echo [1/5] Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com
    pause
    exit /b 1
)
echo ✓ Git is installed

echo.
echo [2/5] Initializing Git repository...
if not exist .git (
    git init
    echo ✓ Git initialized
) else (
    echo ✓ Git already initialized
)

echo.
echo [3/5] Adding files to Git...
git add .
echo ✓ Files added

echo.
echo [4/5] Committing changes...
git commit -m "Deploy: Brand Store E-commerce Platform" >nul 2>&1
if errorlevel 1 (
    echo ℹ No changes to commit
) else (
    echo ✓ Changes committed
)

echo.
echo [5/5] Next steps:
echo.
echo 1. Create a new repository on GitHub
echo    → https://github.com/new
echo.
echo 2. Run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/brand-store.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Then deploy on Vercel:
echo    → https://vercel.com/new
echo.
echo ========================================
echo  Ready for deployment! 🚀
echo ========================================
pause
