import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPartnerMissing() {
  try {
    console.log('🔍 فحص سبب عدم ظهور الشريك في القائمة\n');

    // Check User
    const user = await prisma.user.findUnique({
      where: { email: 'na2699512@gmail.com' }
    });
    console.log('1️⃣ مستخدم User:', user ? '✅ موجود' : '❌ غير موجود');
    if (user) {
      console.log('   - الاسم:', user.name);
      console.log('   - الدور:', user.role);
    }

    // Check Vendor
    if (user) {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: user.id }
      });
      console.log('\n2️⃣ حساب Vendor:', vendor ? '✅ موجود' : '❌ غير موجود');
      if (vendor) {
        console.log('   - Vendor ID:', vendor.id);
        console.log('   - رأس المال:', vendor.capitalBalance);
      }

      // Check PartnerCapital
      if (vendor) {
        const partnerCapital = await prisma.partnerCapital.findMany({
          where: { vendorId: vendor.id }
        });
        console.log('\n3️⃣ سجل PartnerCapital:', partnerCapital.length > 0 ? '✅ موجود' : '❌ غير موجود');
        
        if (partnerCapital.length === 0) {
          console.log('\n❌ المشكلة: لا يوجد سجل في جدول PartnerCapital!');
          console.log('💡 السبب: صفحة إدارة الشركاء تعرض البيانات من جدول PartnerCapital فقط');
          console.log('💡 الحل: يجب إنشاء سجل PartnerCapital للشريك Nawal');
        } else {
          console.log('   عدد السجلات:', partnerCapital.length);
          partnerCapital.forEach(pc => {
            console.log('   - اسم الشريك:', pc.partnerName);
            console.log('   - رأس المال:', pc.capitalAmount);
          });
        }
      }
    }

    // Show all PartnerCapital records
    console.log('\n📊 جميع الشركاء في جدول PartnerCapital:');
    const allPartners = await prisma.partnerCapital.findMany({
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log('عدد الشركاء الإجمالي:', allPartners.length);
    allPartners.forEach((partner, index) => {
      console.log(`\nشريك ${index + 1}:`);
      console.log('   - اسم الشريك:', partner.partnerName);
      console.log('   - اسم المستخدم:', partner.vendor.user?.name || 'لا يوجد');
      console.log('   - البريد:', partner.vendor.user?.email || 'لا يوجد');
      console.log('   - رأس المال:', partner.capitalAmount);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPartnerMissing();
