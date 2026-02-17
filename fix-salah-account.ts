import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSalahAccount() {
  try {
    console.log('🔍 البحث عن حساب صلاح...\n');
    
    // البحث عن حساب صلاح
    const salah = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'صلاح' } },
          { email: { contains: 'salah' } },
        ]
      },
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
      return;
    }

    console.log('✅ تم العثور على حساب صلاح:');
    console.log(`   👤 الاسم: ${salah.name}`);
    console.log(`   📧 البريد: ${salah.email}`);
    console.log(`   🔑 الصلاحية الحالية: ${salah.role}`);
    
    if (salah.vendor?.partners?.[0]) {
      console.log(`   🏢 نوع الشريك: ${salah.vendor.partners[0].partnerType}`);
    }

    // التحقق من أن الشريك من نوع سيارات
    const partnerType = salah.vendor?.partners?.[0]?.partnerType;
    
    if (partnerType !== 'CARS' && partnerType !== 'MOTORCYCLES') {
      console.log('\n⚠️  هذا الشريك ليس من نوع سيارات أو موتوسيكلات');
      console.log('   لا يحتاج إلى تحديث');
      return;
    }

    // تحديث الصلاحية إلى VEHICLE_DEALER
    if (salah.role !== 'VEHICLE_DEALER') {
      console.log('\n🔄 تحديث صلاحية الحساب إلى VEHICLE_DEALER...');
      
      const updated = await prisma.user.update({
        where: { id: salah.id },
        data: {
          role: 'VEHICLE_DEALER',
        }
      });

      console.log('✅ تم تحديث الصلاحية بنجاح!');
      console.log(`   الصلاحية الجديدة: ${updated.role}`);
      console.log('\n🎉 الآن صلاح يمكنه الوصول إلى لوحة تحكم معرض السيارات');
      console.log('   الرابط: /vehicle-dealer/dashboard');
    } else {
      console.log('\n✅ الحساب بالفعل لديه صلاحية VEHICLE_DEALER');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSalahAccount();
