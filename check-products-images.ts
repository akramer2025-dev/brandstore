import { prisma } from "./src/lib/prisma";

async function checkProductImages() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    select: {
      id: true,
      nameAr: true,
      images: true,
      stock: true,
    },
  });

  const withImages = products.filter(p => p.images && p.images !== '[]');
  const withoutImages = products.filter(p => !p.images || p.images === '[]');

  console.log('\n📊 إحصائيات صور المنتجات:\n');
  console.log(`✅ منتجات بصور: ${withImages.length}`);
  console.log(`❌ منتجات بدون صور: ${withoutImages.length}`);
  console.log(`📦 إجمالي المنتجات النشطة: ${products.length}`);
  console.log(`📈 النسبة: ${((withImages.length / products.length) * 100).toFixed(1)}%\n`);

  if (withoutImages.length > 0) {
    console.log('⚠️ منتجات بدون صور (أول 10):');
    withoutImages.slice(0, 10).forEach(p => {
      console.log(`  - ${p.nameAr} (ID: ${p.id})`);
    });
  }

  // فحص جودة الصور
  console.log('\n🔍 فحص جودة الصور:\n');
  const imageStats = {
    cloudinary: 0,
    https: 0,
    http: 0,
    relative: 0,
    empty: 0,
  };

  withImages.forEach(p => {
    try {
      const imgs = JSON.parse(p.images);
      if (imgs.length > 0) {
        const firstImg = imgs[0];
        if (firstImg.includes('cloudinary')) imageStats.cloudinary++;
        else if (firstImg.startsWith('https://')) imageStats.https++;
        else if (firstImg.startsWith('http://')) imageStats.http++;
        else imageStats.relative++;
      }
    } catch (e) {
      imageStats.empty++;
    }
  });

  console.log(`☁️ صور Cloudinary: ${imageStats.cloudinary}`);
  console.log(`🔒 صور HTTPS: ${imageStats.https}`);
  console.log(`🔓 صور HTTP: ${imageStats.http}`);
  console.log(`📁 صور نسبية: ${imageStats.relative}`);
  console.log(`⚠️ صور فارغة/خطأ: ${imageStats.empty}`);

  await prisma.$disconnect();
}

checkProductImages().catch(console.error);
