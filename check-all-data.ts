import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllData() {
  try {
    console.log('🔍 فحص شامل للبيانات...\n')

    // المستخدمين
    const totalUsers = await prisma.user.count()
    console.log(`👥 إجمالي المستخدمين: ${totalUsers}`)
    
    if (totalUsers > 0) {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
      console.log('\nآخر 5 مستخدمين:')
      users.forEach(u => {
        console.log(`  - ${u.name || u.email} (${u.role}) - ${u.createdAt.toLocaleDateString()}`)
      })
    }

    // المنتجات
    const totalProducts = await prisma.product.count()
    console.log(`\n📦 إجمالي المنتجات: ${totalProducts}`)

    // الطلبات
    const totalOrders = await prisma.order.count()
    console.log(`📋 إجمالي الطلبات: ${totalOrders}`)

    // الفئات
    const totalCategories = await prisma.category.count()
    console.log(`📁 إجمالي الفئات: ${totalCategories}`)

    // الفاتورات
    const totalInvoices = await prisma.transaction.count()
    console.log(`💰 إجمالي المعاملات: ${totalInvoices}`)

    console.log('\n⚠️ قاعدة البيانات فاضية تماماً!' )
    console.log('🔍 يبدو إن حصل DB reset أو الاتصال بقاعدة بيانات جديدة')

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllData()
