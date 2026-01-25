@echo off
echo Starting E-Commerce Application...
echo.

cd /d "%~dp0"

echo Opening browser...
start http://localhost:3000

echo Starting development server...
npm run dev

pause
