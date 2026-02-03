@echo off
echo ====================================
echo نسخة احتياطية لقاعدة البيانات
echo ====================================

set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo جاري إنشاء نسخة احتياطية...
npx prisma db execute --file ./backup/backup_%TIMESTAMP%.sql --stdin

echo.
echo ✅ تم إنشاء النسخة الاحتياطية بنجاح!
echo الملف: backup_%TIMESTAMP%.sql
echo.
pause
