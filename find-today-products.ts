import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findTodayProducts() {
  console.log('🔍 البحث عن المنتجات المضافة اليوم...\n');

  try {
    // جلب كل المنتجات المضافة اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProducts = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        vendor: {
          include: {
            user: true
          }
        },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 المنتجات المضافة اليوم (${today.toLocaleDateString('ar-EG')}): ${todayProducts.length}\n`);

    if (todayProducts.length === 0) {
      console.log('⚠️ لا توجد منتجات تم إضافتها اليوم!\n');
      
      // جلب آخر 10 منتجات
      const recentProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          vendor: {
            include: {
              user: true
            }
          }
        }
      });

      console.log('📊 آخر 10 منتجات في النظام:\n');
      recentProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nameAr || p.name}`);
        console.log(`   الشريك: ${p.vendor?.user?.name} (${p.vendor?.user?.email})`);
        console.log(`   نشط: ${p.isActive ? '✅' : '❌'} | ظاهر: ${p.isVisible ? '✅' : '❌'}`);
        console.log(`   التاريخ: ${p.createdAt.toLocaleString('ar-EG')}\n`);
      });

    } else {
      todayProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nameAr || p.name}`);
        console.log(`   🆔 Product ID: ${p.id}`);
        console.log(`   👤 الشريك: ${p.vendor?.user?.name || 'غير معروف'}`);
        console.log(`   📧 البريد: ${p.vendor?.user?.email || 'غير معروف'}`);
        console.log(`   🔑 Vendor ID: ${p.vendorId}`);
        console.log(`   💰 السعر: ${p.price} ج`);
        console.log(`   📦 المخزون: ${p.stock}`);
        console.log(`   ✅ نشط: ${p.isActive ? 'نعم' : 'لا'}`);
        console.log(`   👁️ ظاهر: ${p.isVisible ? 'نعم' : 'لا'}`);
        console.log(`   📂 الفئة: ${p.category?.nameAr || 'بدون فئة'}`);
        console.log(`   ⏰ التاريخ: ${p.createdAt.toLocaleString('ar-EG')}\n`);
      });
    }

    // البحث عن كل users اسمهم يحتوي على "aml"
    console.log('\n🔍 البحث عن كل المستخدمين بحرف "aml":\n');
    
    const amlUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'aml', mode: 'insensitive' } },
          { email: { contains: 'aml', mode: 'insensitive' } }
        ]
      },
      include: {
        vendor: true
      }
    });

    amlUsers.forEach(user => {
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   دور: ${user.role}`);
      if (user.vendor) {
        console.log(`   ✅ لديه vendor account`);
        console.log(`   Vendor ID: ${user.vendor.id}`);
      } else {
        console.log(`   ❌ ليس لديه vendor account`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findTodayProducts();
