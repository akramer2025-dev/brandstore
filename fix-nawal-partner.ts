import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNawalPartner() {
  try {
    console.log('🔧 إصلاح سجل الشريك Nawal...\n');

    // Get User
    const user = await prisma.user.findUnique({
      where: { email: 'na2699512@gmail.com' },
      include: {
        vendor: true
      }
    });

    if (!user || !user.vendor) {
      console.log('❌ لم يتم العثور على المستخدم أو الـ Vendor');
      return;
    }

    console.log('✅ تم العثور على المستخدم:', user.name);
    console.log('✅ تم العثور على Vendor:', user.vendor.id);

    // Check if PartnerCapital already exists
    const existingPartner = await prisma.partnerCapital.findFirst({
      where: { vendorId: user.vendor.id }
    });

    if (existingPartner) {
      console.log('✅ سجل PartnerCapital موجود بالفعل');
      return;
    }

    // Create PartnerCapital record
    console.log('\n📝 إنشاء سجل PartnerCapital...');
    
    const partner = await prisma.partnerCapital.create({
      data: {
        vendorId: user.vendor.id,
        partnerName: user.name,
        partnerType: 'PARTNER',
        capitalAmount: 0,
        initialAmount: 0,
        currentAmount: 0,
        capitalPercent: 0,
        notes: 'تم إنشاء السجل يدوياً لإصلاح البيانات',
      },
    });

    console.log('✅ تم إنشاء سجل PartnerCapital:', partner.id);
    console.log('\n✅ تم إصلاح المشكلة بنجاح!');
    console.log('💡 الآن يجب أن يظهر الشريك في قائمة الشركاء');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNawalPartner();
