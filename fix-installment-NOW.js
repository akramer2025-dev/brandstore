const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixNow() {
  try {
    console.log('🔍 فحص المنتج في السلة...\n');
    
    // فحص المنتج الحالي
    const product = await prisma.product.findUnique({
    where: { id: 'cmlojg4r30003k304gew3kv5q' },
    select: { 
      id: true, 
      name: true, 
      nameAr: true, 
      price: true, 
      allowInstallment: true 
    }
  });
  
  console.log('📦 المنتج:', product);
  console.log('💳 allowInstallment:', product?.allowInstallment);
  
  if (!product) {
    console.log('\n❌ المنتج مش موجود!');
    return;
  }
  
  if (product.allowInstallment) {
    console.log('\n✅ التقسيط مفعل فعلاً!');
    return;
  }
  
  // تفعيل التقسيط
  console.log('\n🔧 تفعيل التقسيط...');
  await prisma.product.update({
    where: { id: 'cmlojg4r30003k304gew3kv5q' },
    data: { allowInstallment: true }
  });
  
  console.log('\n✅ تم تفعيل التقسيط على المنتج!');
  console.log('🔄 حدث الصفحة دلوقتي (Ctrl+Shift+R) - هيظهر التقسيط فوراً!');
  
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixNow();
