@echo off
echo ================================
echo تحديث قاعدة البيانات - Production
echo ================================
echo.
echo تأكد من نسخ DATABASE_URL من Production!
echo.
pause

REM استخدم DATABASE_URL من Production
set DATABASE_URL=postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

echo.
echo جاري رفع التحديثات على قاعدة بيانات Production...
echo.

npx prisma db push

echo.
echo ================================
echo تم تحديث قاعدة البيانات بنجاح!
echo ================================
echo.
pause
