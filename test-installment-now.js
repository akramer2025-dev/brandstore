const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInstallmentSystem() {
  console.log('\n🔍 فحص شامل لنظام التقسيط...\n');
  
  // 1. فحص إعدادات الدفع
  console.log('1️⃣ إعدادات الدفع:');
  const installmentSetting = await prisma.systemSettings.findUnique({
    where: { key: 'payment_method_installment' }
  });
  console.log(`   payment_method_installment: ${installmentSetting?.value || 'غير موجود'}`);
  
  // 2. فحص المنتجات
  console.log('\n2️⃣ المنتجات المفعلة للتقسيط:');
  const products = await prisma.product.findMany({
    where: {
      allowInstallment: true,
      isActive: true,
      isVisible: true
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      isActive: true,
      isVisible: true,
      allowInstallment: true
    },
    take: 10
  });
  
  console.log(`   عدد المنتجات: ${products.length}`);
  products.forEach(p => {
    console.log(`   - ${p.name} (${p.price}ج) - Stock: ${p.stock}`);
    console.log(`     Active: ${p.isActive} | Visible: ${p.isVisible} | Installment: ${p.allowInstallment}`);
  });
  
  // 3. اختبار API endpoint
  console.log('\n3️⃣ اختبار API:');
  if (products.length > 0) {
    const testIds = products.slice(0, 3).map(p => p.id).join(',');
    console.log(`   IDs للاختبار: ${testIds}`);
    
    try {
      const response = await fetch(`http://localhost:3000/api/products/check-installment?ids=${testIds}`);
      const data = await response.json();
      console.log(`   ✅ API Response Status: ${response.status}`);
      console.log(`   ✅ عدد المنتجات المرجعة: ${data.products?.length || 0}`);
      if (data.products && data.products.length > 0) {
        data.products.forEach(p => {
          console.log(`      - ${p.name}: ${p.allowInstallment}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ خطأ في API: ${error.message}`);
    }
  }
  
  // 4. فحص الـ checkout page
  console.log('\n4️⃣ فحص ملف Checkout:');
  const fs = require('fs');
  const checkoutPath = './src/app/checkout/page.tsx';
  if (fs.existsSync(checkoutPath)) {
    const content = fs.readFileSync(checkoutPath, 'utf8');
    
    // البحث عن الكود المهم
    const hasInstallmentCheck = content.includes('installmentEligibleItems');
    const hasAPICall = content.includes('/api/products/check-installment');
    const hasInstallmentOption = content.includes('التقسيط على 4 دفعات');
    
    console.log(`   ✅ installmentEligibleItems: ${hasInstallmentCheck ? 'موجود' : '❌ غير موجود'}`);
    console.log(`   ✅ API Call: ${hasAPICall ? 'موجود' : '❌ غير موجود'}`);
    console.log(`   ✅ Installment Option UI: ${hasInstallmentOption ? 'موجود' : '❌ غير موجود'}`);
  } else {
    console.log('   ❌ ملف checkout غير موجود');
  }
  
  // 5. التوصيات
  console.log('\n📋 التوصيات:');
  if (!installmentSetting || installmentSetting.value !== 'true') {
    console.log('   ⚠️ لازم تفعّل إعداد payment_method_installment');
  }
  if (products.length === 0) {
    console.log('   ⚠️ مفيش منتجات مفعلة للتقسيط');
  } else {
    console.log('   ✅ النظام جاهز! جرب تضيف أي منتج من المنتجات اللي فوق');
  }
  
  console.log('\n🔍 خطوات الاختبار:');
  console.log('   1. امسح السلة تمامًا');
  console.log('   2. ضيف منتج جديد من المنتجات المفعلة');
  console.log('   3. افتح F12 → Console');
  console.log('   4. روح للـ checkout');
  console.log('   5. دوّر على رسالة: "✅ المنتجات القابلة للتقسيط"');
  
  await prisma.$disconnect();
}

testInstallmentSystem().catch(console.error);
