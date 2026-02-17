import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySalahAccount() {
  try {
    console.log('🔍 التحقق من حساب صلاح...\n');
    
    const salah = await prisma.user.findUnique({
      where: { email: 'salah@gmail.com' },
      include: {
        vendor: {
          include: {
            partners: true,
          }
        }
      }
    });

    if (!salah) {
      console.log('❌ لم يتم العثور على حساب صلاح');
      console.log('   البريد المستخدم للبحث: salah@gmail.com');
      return;
    }

    console.log('✅ تم العثور على الحساب:');
    console.log('═'.repeat(60));
    console.log(`\n👤 بيانات الحساب:`);
    console.log(`   الاسم: ${salah.name}`);
    console.log(`   البريد: ${salah.email}`);
    console.log(`   🔑 الصلاحية: ${salah.role}`);
    console.log(`   🆔 User ID: ${salah.id}`);

    if (salah.vendor) {
      console.log(`\n🏪 بيانات المتجر/المعرض:`);
      console.log(`   Vendor ID: ${salah.vendor.id}`);
      console.log(`   Phone: ${salah.vendor.phone || 'غير متوفر'}`);
      console.log(`   المعتمد: ${salah.vendor.isApproved ? 'نعم ✅' : 'لا ❌'}`);
      console.log(`   نشط: ${salah.vendor.isActive ? 'نعم ✅' : 'لا ❌'}`);
    }

    if (salah.vendor?.partners?.[0]) {
      const partner = salah.vendor.partners[0];
      console.log(`\n💼 بيانات الشراكة:`);
      console.log(`   نوع الشريك: ${partner.partnerType}`);
      console.log(`   رأس المال: ${partner.capitalAmount.toLocaleString()} ج`);
      console.log(`   النسبة: ${partner.capitalPercent}%`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n📋 التحقق من الصلاحيات:');
    
    if (salah.role === 'VEHICLE_DEALER') {
      console.log('   ✅ الصلاحية صحيحة: VEHICLE_DEALER');
      console.log('\n🎉 رائع! الحساب جاهز للاستخدام');
      console.log('\n📱 عند تسجيل الدخول سيتم التوجيه إلى:');
      console.log('   /vehicle-dealer/dashboard');
      console.log('\n🔗 الصفحات المتاحة:');
      console.log('   ✓ لوحة التحكم - /vehicle-dealer/dashboard');
      console.log('   ✓ إدارة المركبات - /vehicle-dealer/vehicles');
      console.log('   ✓ إضافة مركبة - /vehicle-dealer/vehicles/new');
      console.log('   ✓ الاستفسارات - /vehicle-dealer/inquiries');
      console.log('   ✓ طلبات التمويل - /vehicle-dealer/financing');
      console.log('   ✓ تجارب القيادة - /vehicle-dealer/test-drives');
    } else {
      console.log(`   ⚠️  الصلاحية حالياً: ${salah.role}`);
      console.log('   ❌ يجب أن تكون: VEHICLE_DEALER');
      console.log('\n💡 لتصحيح الصلاحية، شغل:');
      console.log('   npx tsx update-salah-to-vehicle-dealer.ts');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✨ معلومات تسجيل الدخول:');
    console.log(`   📧 البريد: salah@gmail.com`);
    console.log(`   🔐 كلمة المرور: (التي أدخلتها عند إنشاء الحساب)`);
    console.log(`   🌐 الرابط: http://localhost:3000/auth/login`);
    console.log('\n' + '═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySalahAccount();
