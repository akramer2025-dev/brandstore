import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllPartners() {
  try {
    // جلب جميع الشركاء بدون أي تصفية
    const allPartners = await prisma.partnerCapital.findMany({
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 إجمالي عدد الشركاء في قاعدة البيانات: ${allPartners.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    if (allPartners.length === 0) {
      console.log('❌ لا يوجد أي شركاء في قاعدة البيانات!\n')
      return
    }
    
    allPartners.forEach((partner, index) => {
      console.log(`\n${index + 1}. 👤 ${partner.partnerName}`)
      console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`   🆔 ID: ${partner.id}`)
      console.log(`   🏷️  النوع: ${partner.partnerType}`)
      console.log(`   💰 المبلغ: ${partner.capitalAmount.toLocaleString()} ج`)
      console.log(`   💵 المبلغ الأولي: ${partner.initialAmount.toLocaleString()} ج`)
      console.log(`   💸 المبلغ الحالي: ${partner.currentAmount.toLocaleString()} ج`)
      console.log(`   📊 النسبة: ${partner.capitalPercent.toFixed(2)}%`)
      console.log(`   ${partner.isActive ? '✅' : '❌'} الحالة: ${partner.isActive ? 'نشط' : 'غير نشط'}`)
      console.log(`   📅 تاريخ الإضافة: ${new Date(partner.createdAt).toLocaleString('ar-EG')}`)
      console.log(`   🔗 Vendor ID: ${partner.vendorId}`)
      
      if (partner.vendor && partner.vendor.user) {
        console.log(`   👤 الحساب المرتبط:`)
        console.log(`      📧 البريد: ${partner.vendor.user.email}`)
        console.log(`      👨 الاسم: ${partner.vendor.user.name}`)
        console.log(`      🎭 الدور: ${partner.vendor.user.role}`)
      } else if (partner.vendor) {
        console.log(`   ⚠️  Vendor موجود لكن بدون user`)
      } else {
        console.log(`   ❌ لا يوجد vendor مرتبط!`)
      }
      
      if (partner.notes) {
        console.log(`   📝 ملاحظات: ${partner.notes}`)
      }
    })
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ تم عرض ${allPartners.length} شريك بنجاح`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // فحص إذا كان هناك مشكلة في الـ API
    console.log('\n🔍 فحص تنسيق البيانات كما سيستقبلها الواجهة:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const formattedPartners = allPartners.map(partner => ({
      id: partner.id,
      partnerName: partner.partnerName,
      partnerType: partner.partnerType,
      capitalAmount: partner.capitalAmount,
      initialAmount: partner.initialAmount,
      currentAmount: partner.currentAmount,
      capitalPercent: partner.capitalPercent,
      isActive: partner.isActive,
      notes: partner.notes,
      createdAt: partner.createdAt,
      joinDate: partner.joinDate,
      vendor: partner.vendor ? {
        id: partner.vendor.id,
        userId: partner.vendor.userId,
        user: partner.vendor.user ? {
          id: partner.vendor.user.id,
          name: partner.vendor.user.name,
          email: partner.vendor.user.email,
        } : null,
      } : null,
    }))
    
    console.log(JSON.stringify(formattedPartners, null, 2))
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllPartners()
