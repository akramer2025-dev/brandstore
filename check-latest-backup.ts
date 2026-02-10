import fs from 'fs';
import path from 'path';

function checkLatestBackup() {
  console.log('🔍 فحص آخر Backup...\n');

  const backupsDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupsDir)) {
    console.log('❌ مجلد الbackups غير موجود!\n');
    return;
  }

  const files = fs.readdirSync(backupsDir)
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .map(f => {
      const filepath = path.join(backupsDir, f);
      const stats = fs.statSync(filepath);
      return {
        name: f,
        path: filepath,
        size: stats.size,
        date: stats.mtime,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (files.length === 0) {
    console.log('❌ لا توجد backups!\n');
    return;
  }

  console.log(`✅ إجمالي الBackups: ${files.length}\n`);
  console.log('📊 آخر 5 backups:\n');

  files.slice(0, 5).forEach((file, i) => {
    console.log(`${i + 1}. ${file.name}`);
    console.log(`   📅 التاريخ: ${file.date.toLocaleString('ar-EG')}`);
    console.log(`   📦 الحجم: ${(file.size / 1024).toFixed(2)} KB`);
    
    try {
      const content = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
      if (content.stats) {
        console.log(`   📊 المحتوى:`);
        console.log(`      - ${content.stats.products || 0} منتج`);
        console.log(`      - ${content.stats.users || 0} مستخدم`);
        console.log(`      - ${content.stats.orders || 0} طلب`);
        console.log(`      - ${content.stats.categories || 0} فئة`);
      }
    } catch (e) {
      console.log(`   ⚠️  تعذر قراءة المحتوى`);
    }
    console.log();
  });

  const latest = files[0];
  const ageInHours = (Date.now() - latest.date.getTime()) / (1000 * 60 * 60);
  
  console.log('⏰ حالة الBackup:');
  if (ageInHours <= 24) {
    console.log(`   ✅ آخر backup حديث (منذ ${ageInHours.toFixed(1)} ساعة)`);
  } else if (ageInHours <= 48) {
    console.log(`   ⚠️  آخر backup منذ ${(ageInHours / 24).toFixed(1)} يوم`);
  } else {
    console.log(`   🔴 آخر backup قديم! (منذ ${(ageInHours / 24).toFixed(1)} يوم)`);
    console.log('   💡 اعمل backup جديد: npx tsx auto-backup-daily.ts');
  }
}

checkLatestBackup();
