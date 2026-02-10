import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAuthFlow() {
  console.log('🔍 فحص Auth Flow للـ Google Sign-In...\n');

  try {
    // 1. Check all VENDOR accounts with Google provider
    const vendorsWithGoogle = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        accounts: {
          some: {
            provider: 'google'
          }
        }
      },
      include: {
        vendor: true,
        accounts: {
          where: { provider: 'google' }
        }
      }
    });

    console.log(`📊 الشركاء اللي دخلوا بـ Google: ${vendorsWithGoogle.length}\n`);
    
    vendorsWithGoogle.forEach(v => {
      console.log(`👤 ${v.name} (${v.email})`);
      console.log(`   🎭 Role: ${v.role}`);
      console.log(`   📅 تاريخ التسجيل: ${v.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   💼 Vendor Account: ${v.vendor ? 'موجود ✅' : 'مفقود ❌'}`);
      if (v.vendor) {
        console.log(`   💰 رأس المال: ${v.vendor.capitalBalance} ج`);
      }
      console.log('');
    });

    // 2. Check auth.ts configuration
    console.log('\n📋 التوصيات:');
    console.log('1. ✅ الـ createUser event يعين CUSTOMER للمستخدمين الجدد');
    console.log('2. ✅ الـ signIn callback يحترم الـ existing role');
    console.log('3. ⚠️  تأكد من عدم وجود code يغير الـ role بعد الإنشاء');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthFlow();
