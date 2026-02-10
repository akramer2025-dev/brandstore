import readline from 'readline';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Password للحماية
const MASTER_PASSWORD = 'Remo@2026!DeleteProtection';

export async function requirePasswordBeforeDelete(operationName: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n🔒 ═══════════════════════════════════════════════════');
    console.log('⚠️  تحذير: عملية حذف بيانات خطيرة!');
    console.log(`📋 العملية: ${operationName}`);
    console.log('🔒 ═══════════════════════════════════════════════════\n');

    rl.question('🔑 أدخل كلمة المرور للمتابعة: ', (password) => {
      rl.close();
      
      if (password === MASTER_PASSWORD) {
        console.log('✅ كلمة المرور صحيحة\n');
        resolve(true);
      } else {
        console.log('❌ كلمة المرور خاطئة! العملية ملغية.\n');
        resolve(false);
      }
    });
  });
}

export async function createBackupBeforeDelete(reason: string): Promise<string> {
  console.log('\n💾 جاري عمل backup قبل الحذف...');
  
  try {
    // تشغيل script الbackup
    execSync('npx tsx backup-all-data.ts', { stdio: 'inherit' });
    
    const timestamp = new Date().toISOString();
    console.log(`✅ تم عمل backup بنجاح - ${timestamp}`);
    console.log(`📝 السبب: ${reason}\n`);
    
    return timestamp;
  } catch (error) {
    console.error('❌ فشل عمل الbackup:', error);
    throw new Error('لا يمكن المتابعة بدون backup');
  }
}

export async function confirmDeletion(itemCount: number, itemType: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  ═══════════════════════════════════════════════════');
    console.log(`🗑️  سيتم حذف ${itemCount} ${itemType}`);
    console.log('⚠️  هذه العملية لا يمكن التراجع عنها!');
    console.log('⚠️  ═══════════════════════════════════════════════════\n');

    rl.question('❓ هل أنت متأكد؟ اكتب "نعم احذف" للتأكيد: ', (answer) => {
      rl.close();
      
      if (answer === 'نعم احذف') {
        console.log('✅ تم التأكيد\n');
        resolve(true);
      } else {
        console.log('❌ العملية ملغية\n');
        resolve(false);
      }
    });
  });
}

// مثال استخدام:
// if (!(await requirePasswordBeforeDelete('حذف كل المنتجات'))) {
//   process.exit(1);
// }
// await createBackupBeforeDelete('حذف منتجات تجريبية');
// if (!(await confirmDeletion(50, 'منتج'))) {
//   process.exit(1);
// }
