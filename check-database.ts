// Script للتحقق من وجود البيانات في الـ Database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 فحص الاتصال بقاعدة البيانات...');
    
    // اختبار الاتصال
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!\n');

    // فحص المنتجات
    const productsCount = await prisma.product.count();
    console.log(`📦 عدد المنتجات: ${productsCount}`);
    
    if (productsCount > 0) {
      const products = await prisma.product.findMany({
        take: 5,
        select: {
          id: true,
          nameAr: true,
          price: true,
          stock: true,
          isActive: true
        }
      });
      console.log('\n📋 أول 5 منتجات:');
      products.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.nameAr} - ${p.price} ج.م - مخزون: ${p.stock} - ${p.isActive ? 'نشط' : 'غير نشط'}`);
      });
    } else {
      console.log('⚠️ لا توجد منتجات في قاعدة البيانات!');
    }

    // فحص الفئات
    const categoriesCount = await prisma.category.count();
    console.log(`\n📂 عدد الفئات: ${categoriesCount}`);
    
    if (categoriesCount > 0) {
      const categories = await prisma.category.findMany({
        take: 5,
        select: {
          id: true,
          nameAr: true,
          _count: {
            select: { products: true }
          }
        }
      });
      console.log('\n📋 أول 5 فئات:');
      categories.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.nameAr} - عدد المنتجات: ${c._count.products}`);
      });
    } else {
      console.log('⚠️ لا توجد فئات في قاعدة البيانات!');
    }

    // فحص المستخدمين
    const usersCount = await prisma.user.count();
    console.log(`\n👥 عدد المستخدمين: ${usersCount}`);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    console.log('\n📋 جميع المستخدمين:');
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name || 'بدون اسم'} (${u.email}) - ${u.role}`);
    });

    // فحص الطلبات
    const ordersCount = await prisma.order.count();
    console.log(`\n🛒 عدد الطلبات: ${ordersCount}`);

    console.log('\n✅ الفحص انتهى بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
