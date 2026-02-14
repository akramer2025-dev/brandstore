import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncProductsToCatalog() {
  try {
    console.log('🔍 جاري جلب المنتجات من قاعدة البيانات...\n');

    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
      take: 100, // أول 100 منتج
    });

    console.log(`✅ تم العثور على ${products.length} منتج نشط\n`);

    if (products.length === 0) {
      console.log('❌ لا توجد منتجات نشطة في قاعدة البيانات!');
      return;
    }

    // Check Facebook credentials
    const catalogId = process.env.FACEBOOK_CATALOG_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!catalogId) {
      console.log('⚠️ FACEBOOK_CATALOG_ID غير موجود في .env');
      console.log('📝 أضف هذا السطر في ملف .env:');
      console.log('   FACEBOOK_CATALOG_ID=your_catalog_id');
      console.log('\n💡 للحصول على Catalog ID:');
      console.log('   1. افتح Commerce Manager');
      console.log('   2. اختر الكتالوج "Remo Store Bot"');
      console.log('   3. Settings → رقم معرف الكتالوج');
      return;
    }

    if (!accessToken) {
      console.log('❌ FACEBOOK_ACCESS_TOKEN غير موجود!');
      console.log('الحل: أضف Access Token في .env');
      return;
    }

    console.log('✅ Facebook Catalog ID موجود:', catalogId);
    console.log('\n🚀 جاري رفع المنتجات للكتالوج...\n');

    // Create product feed data
    const productFeed = products.map((product) => {
      // Parse images (stored as JSON string or comma-separated URLs)
      let imageUrl = 'https://www.remostore.net/placeholder.jpg';
      if (product.images) {
        try {
          const imagesArray = JSON.parse(product.images);
          imageUrl = imagesArray[0] || imageUrl;
        } catch {
          // If not JSON, might be comma-separated
          const urls = product.images.split(',');
          imageUrl = urls[0]?.trim() || imageUrl;
        }
      }
      
      return {
        id: product.id,
        title: product.name,
        description: product.description || product.name,
        availability: product.stock > 0 ? 'in stock' : 'out of stock',
        condition: 'new',
        price: `${product.price} EGP`,
        link: `https://www.remostore.net/product/${product.id}`,
        image_link: imageUrl,
        brand: 'Remo Store',
        google_product_category: product.category?.name || 'Apparel & Accessories',
      };
    });

    console.log('📦 عينة من المنتجات:');
    productFeed.slice(0, 3).forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.title}`);
      console.log(`   السعر: ${p.price}`);
      console.log(`   الحالة: ${p.availability}`);
      console.log(`   الرابط: ${p.link}`);
    });

    // Upload to Facebook Catalog using Batch API
    console.log('\n🔄 جاري الرفع على Facebook...');
    
    const batchRequests = productFeed.map((product) => ({
      method: 'POST',
      relative_url: `${catalogId}/products`,
      body: new URLSearchParams({
        retailer_id: product.id,
        name: product.title,
        description: product.description,
        availability: product.availability,
        condition: product.condition,
        price: product.price,
        url: product.link,
        image_url: product.image_link,
        brand: product.brand,
        google_product_category: product.google_product_category,
      }).toString(),
    }));

    // Facebook Batch API allows max 50 requests per call
    const BATCH_SIZE = 50;
    let totalSuccess = 0;
    let totalFailed = 0;

    for (let i = 0; i < batchRequests.length; i += BATCH_SIZE) {
      const batch = batchRequests.slice(i, i + BATCH_SIZE);
      
      const response = await fetch(
        `https://graph.facebook.com/v21.0/?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.log(`\n❌ فشل رفع الدفعة ${Math.floor(i / BATCH_SIZE) + 1}:`);
        console.log(error);
        totalFailed += batch.length;
        continue;
      }

      const results = await response.json();
      
      results.forEach((result: any, index: number) => {
        if (result.code === 200) {
          totalSuccess++;
        } else {
          totalFailed++;
          console.log(`   ❌ فشل: ${batch[index].body}`);
        }
      });

      console.log(`   ✅ تم رفع ${Math.min((i + BATCH_SIZE), batchRequests.length)} / ${batchRequests.length}`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 النتيجة النهائية:');
    console.log(`   ✅ تم رفع: ${totalSuccess} منتج`);
    console.log(`   ❌ فشل: ${totalFailed} منتج`);
    console.log(`   📦 إجمالي: ${products.length} منتج`);
    console.log('═══════════════════════════════════════\n');

    if (totalSuccess > 0) {
      console.log('🎉 نجح! الآن الكتالوج فيه منتجات!');
      console.log('\n📝 الخطوات التالية:');
      console.log('   1. افتح Commerce Manager على Facebook');
      console.log('   2. اختر كتالوج "Remo Store Bot"');
      console.log('   3. ستشوف المنتجات في "Items" tab');
      console.log('   4. انتظر 15-30 دقيقة للمراجعة');
      console.log('   5. بعد الموافقة، معدل المطابقة سيصير 100%! 🎯');
    } else {
      console.log('❌ فشل رفع جميع المنتجات!');
      console.log('💡 الأسباب المحتملة:');
      console.log('   1. Access Token منتهي');
      console.log('   2. Catalog ID غلط');
      console.log('   3. صلاحيات غير كافية');
      console.log('\nالحل: راجع Facebook Settings وتأكد من الصلاحيات');
    }

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative: Generate CSV Feed
async function generateCSVFeed() {
  try {
    console.log('\n📄 جاري إنشاء CSV Feed...\n');

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      take: 1000,
    });

    const csv = [
      'id,title,description,availability,condition,price,link,image_link,brand,google_product_category',
      ...products.map((product) => {
        // Parse images
        let imageUrl = 'https://www.remostore.net/placeholder.jpg';
        if (product.images) {
          try {
            const imagesArray = JSON.parse(product.images);
            imageUrl = imagesArray[0] || imageUrl;
          } catch {
            const urls = product.images.split(',');
            imageUrl = urls[0]?.trim() || imageUrl;
          }
        }
        
        return [
          product.id,
          `"${product.name.replace(/"/g, '""')}"`,
          `"${(product.description || product.name).replace(/"/g, '""')}"`,
          product.stock > 0 ? 'in stock' : 'out of stock',
          'new',
          `${product.price} EGP`,
          `https://www.remostore.net/product/${product.id}`,
          imageUrl,
          'Remo Store',
          product.category?.name || 'Apparel & Accessories',
        ].join(',');
      }),
    ].join('\n');

    const fs = require('fs');
    fs.writeFileSync('product-feed.csv', csv);

    console.log('✅ تم إنشاء product-feed.csv بنجاح!');
    console.log(`📦 عدد المنتجات: ${products.length}`);
    console.log('\n📝 لرفعه على Facebook:');
    console.log('   1. افتح Commerce Manager → Catalogs');
    console.log('   2. اختر "Remo Store Bot"');
    console.log('   3. Data Sources → Add Items');
    console.log('   4. Upload File → اختر product-feed.csv');
    console.log('   5. Schedule: Daily (اختياري)');

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
const args = process.argv.slice(2);
if (args[0] === '--csv') {
  generateCSVFeed();
} else {
  syncProductsToCatalog();
}
