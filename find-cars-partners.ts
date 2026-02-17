import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findCarsPartners() {
  try {
    console.log('🔍 البحث عن جميع شركاء السيارات...\n');
    
    // البحث عن جميع شركاء السيارات
    const carsPartners = await prisma.partnerCapital.findMany({
      where: {
        partnerType: {
          in: ['CARS', 'MOTORCYCLES']
        }
      },
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 تم العثور على ${carsPartners.length} شريك سيارات/موتوسيكلات:\n`);
    console.log('━'.repeat(80));

    if (carsPartners.length === 0) {
      console.log('⚠️  لا يوجد شركاء سيارات حالياً');
      return;
    }

    for (const partner of carsPartners) {
      console.log(`\n🚗 ${partner.partnerName}`);
      console.log(`   📧 البريد: ${partner.vendor?.user?.email || 'غير متوفر'}`);
      console.log(`   👤 اسم المستخدم: ${partner.vendor?.user?.name || 'غير متوفر'}`);
      console.log(`   🔑 الصلاحية: ${partner.vendor?.user?.role || 'لا يوجد حساب'}`);
      console.log(`   🏢 نوع الشريك: ${partner.partnerType}`);
      console.log(`   💰 رأس المال: ${partner.capitalAmount.toLocaleString()} ج`);
      console.log(`   📅 تاريخ الإنضمام: ${partner.createdAt.toLocaleDateString('ar-EG')}`);
      
      // التحقق من الصلاحية
      if (partner.vendor?.user) {
        const currentRole = partner.vendor.user.role;
        const correctRole = 'VEHICLE_DEALER';
        
        if (currentRole !== correctRole) {
          console.log(`   ⚠️  يحتاج إلى تحديث: ${currentRole} → ${correctRole}`);
          console.log(`   🆔 User ID: ${partner.vendor.user.id}`);
        } else {
          console.log(`   ✅ الصلاحية صحيحة`);
        }
      } else {
        console.log(`   ❌ لا يوجد حساب مستخدم`);
      }
    }

    console.log('\n' + '━'.repeat(80));

    // تحديث جميع الشركاء ذوي الصلاحيات الخاطئة
    const partnersNeedingUpdate = carsPartners.filter(
      p => p.vendor?.user && p.vendor.user.role !== 'VEHICLE_DEALER'
    );

    if (partnersNeedingUpdate.length > 0) {
      console.log(`\n🔄 تحديث ${partnersNeedingUpdate.length} شريك إلى VEHICLE_DEALER...\n`);
      
      for (const partner of partnersNeedingUpdate) {
        if (partner.vendor?.user?.id) {
          await prisma.user.update({
            where: { id: partner.vendor.user.id },
            data: { role: 'VEHICLE_DEALER' }
          });
          
          console.log(`✅ تم تحديث: ${partner.partnerName} (${partner.vendor.user.email})`);
        }
      }

      console.log(`\n🎉 تم تحديث جميع الشركاء بنجاح!`);
      console.log('\n📱 الآن يمكنهم الوصول إلى:');
      console.log('   /vehicle-dealer/dashboard - لوحة تحكم معرض السيارات');
      console.log('   /vendor/vehicles - إدارة المركبات');
    } else {
      console.log('\n✅ جميع شركاء السيارات لديهم الصلاحيات الصحيحة');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findCarsPartners();
