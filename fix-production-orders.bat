@echo off
echo ========================================
echo تنظيف طلبات الموقع الانتاجي
echo ========================================
echo.

echo 1. فحص قاعدة البيانات الانتاجية...
call npx tsx check-production-db.ts

echo.
echo 2. هل تريد حذف الطلبات الموجودة؟ (y/n)
set /p confirm="الاختيار: "

if /i "%confirm%"=="y" (
    echo.
    echo جاري الحذف...
    set DELETE_ORDERS=true
    call npx tsx check-production-db.ts
    echo.
    echo ✅ تم التنظيف بنجاح!
) else (
    echo.
    echo ❌ تم الإلغاء
)

echo.
pause
