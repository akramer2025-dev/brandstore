import { prisma } from "./src/lib/prisma";

async function testImageParsing() {
  const baseUrl = "https://www.remostore.net";
  
  const getFirstImage = (images: string | null): string => {
    if (!images) return `${baseUrl}/placeholder.jpg`;
    
    try {
      // محاولة parse كـ JSON array
      const imageArray = JSON.parse(images);
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        return imageArray[0];
      }
    } catch {
      // إذا فشل الـ parse، نفترض أنها comma-separated string
      if (images.includes(',')) {
        const firstImage = images.split(',')[0].trim();
        if (firstImage) return firstImage;
      } else if (images.startsWith('http')) {
        // URL مباشر
        return images;
      }
    }
    
    return `${baseUrl}/placeholder.jpg`;
  };

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
    },
    select: {
      id: true,
      nameAr: true,
      images: true,
    },
    take: 10,
  });

  console.log('\n✅ اختبار استخراج الصور:\n');
  
  let successCount = 0;
  let failCount = 0;
  
  products.forEach((p, idx) => {
    const image = getFirstImage(p.images);
    const isPlaceholder = image.includes('placeholder.jpg');
    
    if (!isPlaceholder) successCount++;
    else failCount++;
    
    console.log(`${idx + 1}. ${p.nameAr}`);
    console.log(`   ${isPlaceholder ? '❌' : '✅'} ${image}`);
    console.log('');
  });
  
  console.log(`\n📊 النتيجة:`);
  console.log(`✅ صور صحيحة: ${successCount}/${products.length}`);
  console.log(`❌ placeholder: ${failCount}/${products.length}`);
  console.log(`📈 نسبة النجاح: ${((successCount / products.length) * 100).toFixed(1)}%\n`);

  await prisma.$disconnect();
}

testImageParsing().catch(console.error);
