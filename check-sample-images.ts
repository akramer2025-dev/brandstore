import { prisma } from "./src/lib/prisma";

async function checkSampleProduct() {
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
    take: 5,
  });

  console.log('\n📸 عينة من المنتجات وصورها:\n');
  
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.nameAr}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Images (raw): ${p.images}`);
    console.log(`   Type: ${typeof p.images}`);
    
    if (p.images) {
      try {
        const parsed = JSON.parse(p.images);
        console.log(`   Parsed: ${JSON.stringify(parsed)}`);
        console.log(`   Is Array: ${Array.isArray(parsed)}`);
        console.log(`   Length: ${parsed.length || 'N/A'}`);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`   First Image: ${parsed[0]}`);
        }
      } catch (e) {
        console.log(`   ❌ Parse Error: ${e.message}`);
        // Try as direct URL
        console.log(`   Trying as direct URL: ${p.images}`);
      }
    }
    console.log('');
  });

  await prisma.$disconnect();
}

checkSampleProduct().catch(console.error);
