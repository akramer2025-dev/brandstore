const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPILocally() {
  console.log('\n🧪 اختبار الـ API محليًا (بدون HTTP)...\n');
  
  // نفس الكود اللي في الـ API بالظبط
  const productIds = [
    'cml87u9qy0001l804pwnx4av7',
    'cml8l87yb0001i404vn2dmntv',
    'cml8m8u8y0001i80478tgw3yq'
  ];
  
  console.log('📋 IDs للاختبار:');
  productIds.forEach((id, i) => console.log(`   ${i+1}. ${id}`));
  
  try {
    console.log('\n1️⃣ جلب المنتجات من قاعدة البيانات...');
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true,
        isVisible: true,
        isActive: true
      }
    });
    
    console.log(`   ✅ تم جلب ${products.length} منتج`);
    products.forEach(p => {
      console.log(`      - ${p.name}: allowInstallment = ${p.allowInstallment}`);
    });
    
    console.log('\n2️⃣ فلترة المنتجات القابلة للتقسيط...');
    const eligibleProducts = products.filter(p => p.allowInstallment === true);
    console.log(`   ✅ ${eligibleProducts.length} منتج قابل للتقسيط`);
    
    if (eligibleProducts.length > 0) {
      console.log('\n   ✅ المنتجات القابلة للتقسيط:');
      eligibleProducts.forEach(p => {
        console.log(`      - ${p.name} (${p.price}ج)`);
      });
    }
    
    console.log('\n✅ الكود يعمل بشكل صحيح محليًا!');
    console.log('⚠️ المشكلة على الأغلب في الـ Next.js API route أو في الـ server logs');
    
  } catch (error) {
    console.log('\n❌ خطأ:', error.message);
    console.log('   Stack:', error.stack);
  }
  
  await prisma.$disconnect();
}

testAPILocally().catch(console.error);
