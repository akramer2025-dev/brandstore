import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSalahToVehicleDealer() {
  try {
    console.log('🔍 البحث عن شريك salah...\n');
    
    // البحث عن الشريك salah
    const salahPartner = await prisma.partnerCapital.findFirst({
      where: {
        partnerName: { contains: 'salah' },
        partnerType: 'CARS'
      },
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    });

    if (!salahPartner) {
      console.log('❌ لم يتم العثور على شريك salah');
      return;
    }

    console.log('✅ تم العثور على الشريك:');
    console.log(`   👤 الاسم: ${salahPartner.partnerName}`);
    console.log(`   📧 البريد: ${salahPartner.vendor?.user?.email}`);
    console.log(`   🏢 النوع: ${salahPartner.partnerType}`);
    console.log(`   🔑 الصلاحية الحالية: ${salahPartner.vendor?.user?.role}`);
    console.log(`   🆔 User ID: ${salahPartner.vendor?.user?.id}`);

    if (!salahPartner.vendor?.user?.id) {
      console.log('\n❌ لا يوجد حساب مستخدم مرتبط بهذا الشريك');
      return;
    }

    if (salahPartner.vendor.user.role === 'VEHICLE_DEALER') {
      console.log('\n✅ الحساب بالفعل لديه صلاحية VEHICLE_DEALER');
      console.log('   لا حاجة للتحديث');
      return;
    }

    console.log('\n🔄 تحديث الصلاحية إلى VEHICLE_DEALER...');

    const updated = await prisma.user.update({
      where: { id: salahPartner.vendor.user.id },
      data: {
        role: 'VEHICLE_DEALER'
      }
    });

    console.log('✅ تم التحديث بنجاح!');
    console.log(`   الصلاحية القديمة: ${salahPartner.vendor.user.role}`);
    console.log(`   الصلاحية الجديدة: ${updated.role}`);
    
    console.log('\n🎉 رائع! الآن يمكن لصلاح:');
    console.log('   ✅ تسجيل الدخول بالبريد: salah@gmail.com');
    console.log('   ✅ الوصول إلى لوحة تحكم معرض السيارات');
    console.log('   ✅ إضافة وإدارة السيارات والموتوسيكلات');
    console.log('   ✅ متابعة الاستفسارات والطلبات');
    console.log('   ✅ إدارة التمويل وتجارب القيادة');
    
    console.log('\n📱 الروابط المتاحة:');
    console.log('   /vehicle-dealer/dashboard - لوحة التحكم الرئيسية');
    console.log('   /vehicle-dealer/vehicles - إدارة المركبات');
    console.log('   /vehicle-dealer/vehicles/new - إضافة مركبة جديدة');
    console.log('   /vehicle-dealer/inquiries - الاستفسارات');
    console.log('   /vehicle-dealer/financing - طلبات التمويل');
    console.log('   /vehicle-dealer/test-drives - تجارب القيادة');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSalahToVehicleDealer();
