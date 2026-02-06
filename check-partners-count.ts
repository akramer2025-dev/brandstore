import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPartnersCount() {
  try {
    const count = await prisma.partnerCapital.count()
    console.log('\n📊 عدد الشركاء في قاعدة البيانات:', count)
    
    const partners = await prisma.partnerCapital.findMany({
      select: {
        id: true,
        partnerName: true,
        capitalAmount: true,
        capitalPercent: true,
        isActive: true,
        vendorId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    console.log('\n📋 قائمة الشركاء:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    partners.forEach((partner, index) => {
      console.log(`\n${index + 1}. ${partner.partnerName}`)
      console.log(`   المبلغ: ${partner.capitalAmount} ج`)
      console.log(`   النسبة: ${partner.capitalPercent}%`)
      console.log(`   نشط: ${partner.isActive ? 'نعم' : 'لا'}`)
      console.log(`   Vendor ID: ${partner.vendorId}`)
      console.log(`   التاريخ: ${partner.createdAt}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPartnersCount()
