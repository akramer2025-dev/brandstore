import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPartnersAPI() {
  try {
    console.log('🔍 اختبار API الشركاء...\n')

    // جلب جميع الـ vendors
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        },
        partners: true,
      },
    })

    console.log(`✅ تم جلب ${vendors.length} شريك من قاعدة البيانات\n`)

    // تنسيق البيانات
    const formattedPartners = vendors.map(vendor => {
      const partnerCapital = vendor.partners?.[0];
      
      return {
        id: vendor.id,
        partnerName: vendor.storeName || vendor.user?.name || 'غير محدد',
        partnerType: partnerCapital?.partnerType || 'VENDOR',
        capitalAmount: vendor.capitalBalance || 0,
        initialAmount: vendor.capitalBalance || 0,
        currentAmount: vendor.capitalBalance || 0,
        capitalPercent: vendor.commissionRate || 15,
        joinDate: vendor.createdAt.toISOString(),
        isActive: vendor.isActive,
        notes: vendor.description || null,
        createdAt: vendor.createdAt.toISOString(),
        email: vendor.user?.email,
        phone: vendor.user?.phone,
      };
    })

    console.log('════════════════════════════════════════════════════════════════════════════════')
    console.log('📋 قائمة الشركاء:')
    console.log('════════════════════════════════════════════════════════════════════════════════\n')

    formattedPartners.forEach((partner, index) => {
      console.log(`${index + 1}. ${partner.partnerName}`)
      console.log(`   📧 Email: ${partner.email}`)
      console.log(`   📱 Phone: ${partner.phone || 'N/A'}`)
      console.log(`   💰 رأس المال: ${partner.capitalAmount.toLocaleString()} ج`)
      console.log(`   💸 نسبة العمولة: ${partner.capitalPercent}%`)
      console.log(`   ${partner.isActive ? '✅ نشط' : '❌ غير نشط'}`)
      console.log(`   📅 تاريخ الانضمام: ${new Date(partner.joinDate).toLocaleDateString('ar-EG')}`)
      console.log()
    })

    console.log('════════════════════════════════════════════════════════════════════════════════')
    console.log(`✅ إجمالي الشركاء: ${formattedPartners.length}`)
    console.log(`✅ الشركاء النشطين: ${formattedPartners.filter(p => p.isActive).length}`)
    console.log('════════════════════════════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ حدث خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPartnersAPI()
