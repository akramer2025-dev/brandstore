@echo off
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [1/3] Building...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [2/3] Committing...
    git add .
    git commit -m "Add subcategories dropdown + Fix Next.js 15 params"
    
    echo.
    echo [3/3] Pushing to GitHub...
    git push origin main
    
    echo.
    echo ======================================
    echo   DEPLOYMENT SUCCESSFUL!
    echo ======================================
    echo.
    echo Check: https://www.remostore.net
    echo Wait: 2-3 minutes for build
) else (
    echo.
    echo ======================================
    echo   BUILD FAILED!
    echo ======================================
    echo Check errors above
)

pause
