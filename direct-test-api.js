const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function directTest() {
  console.log('\n🔍 اختبار مباشر للـ API...\n');
  
  // جلب أول 3 منتجات مفعلة
  const activeProducts = await prisma.product.findMany({
    where: {
      allowInstallment: true,
      isActive: true,
      isVisible: true,
      stock: { gt: 0 } // موجود في المخزن
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      allowInstallment: true,
      isActive: true,
      isVisible: true
    },
    take: 5
  });
  
  console.log('📦 المنتجات المتاحة (في المخزن):');
  activeProducts.forEach(p => {
    console.log(`\n   ${p.name}`);
    console.log(`   - ID: ${p.id}`);
    console.log(`   - السعر: ${p.price} ج`);
    console.log(`   - المخزن: ${p.stock} قطعة`);
    console.log(`   - Active: ${p.isActive}`);
    console.log(`   - Visible: ${p.isVisible}`);
    console.log(`   - Installment: ${p.allowInstallment}`);
  });
  
  if (activeProducts.length > 0) {
    console.log('\n\n🧪 اختبار الـ API:');
    const testIds = activeProducts.map(p => p.id).join(',');
    console.log(`   URL: http://localhost:3000/api/products/check-installment?ids=${testIds}`);
    
    try {
      const response = await fetch(`http://localhost:3000/api/products/check-installment?ids=${testIds}`);
      const data = await response.json();
      
      console.log(`\n   ✅ Status: ${response.status}`);
      console.log(`   ✅ Success: ${data.success}`);
      console.log(`   ✅ المنتجات المرجعة: ${data.products?.length || 0}`);
      
      if (data.products && data.products.length > 0) {
        console.log('\n   📋 المنتجات:');
        data.products.forEach(p => {
          console.log(`      - ${p.name} (${p.price}ج)`);
        });
      } else {
        console.log('\n   ⚠️ الـ API مرجعتش أي منتجات!');
        console.log('   🔍 تفاصيل الرد:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.log(`\n   ❌ خطأ في API: ${error.message}`);
    }
  }
  
  // فحص allowInstallment في قاعدة البيانات
  console.log('\n\n🔍 فحص حقل allowInstallment:');
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      allowInstallment: true
    },
    take: 20
  });
  
  const withInstallment = allProducts.filter(p => p.allowInstallment === true).length;
  const withoutInstallment = allProducts.filter(p => p.allowInstallment === false || p.allowInstallment === null).length;
  
  console.log(`   ✅ منتجات بتقسيط: ${withInstallment}`);
  console.log(`   ❌ منتجات بدون تقسيط: ${withoutInstallment}`);
  
  // فحص نوع الحقل
  console.log('\n🔍 فحص نوع بيانات الحقل:');
  const sample = await prisma.product.findFirst({
    where: { allowInstallment: true },
    select: { id: true, name: true, allowInstallment: true }
  });
  
  if (sample) {
    console.log(`   Product: ${sample.name}`);
    console.log(`   allowInstallment value: ${sample.allowInstallment}`);
    console.log(`   allowInstallment type: ${typeof sample.allowInstallment}`);
    console.log(`   === true: ${sample.allowInstallment === true}`);
    console.log(`   == true: ${sample.allowInstallment == true}`);
  }
  
  await prisma.$disconnect();
}

directTest().catch(console.error);
