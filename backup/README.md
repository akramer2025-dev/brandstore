# دليل النسخ الاحتياطية

سيتم حفظ النسخ الاحتياطية هنا.

## كيفية عمل نسخة احتياطية:
```bash
# في Windows
.\backup-database.bat

# في Linux/Mac  
npm run backup
```

## كيفية استعادة نسخة احتياطية:
```bash
npx prisma db execute --file ./backup/backup_YYYYMMDD_HHMM.sql
```
