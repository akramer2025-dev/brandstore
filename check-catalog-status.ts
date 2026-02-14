// Check Facebook Catalog Status
// Run: npx tsx check-catalog-status.ts

async function checkCatalogStatus() {
  console.log('🔍 Checking Facebook Catalog Status...\n');

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const catalogId = '900247573275779'; // Remo Store Bot

  if (!accessToken) {
    console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env');
    process.exit(1);
  }

  try {
    // Get catalog info
    const catalogUrl = `https://graph.facebook.com/v21.0/${catalogId}?fields=name,product_count,vertical,business&access_token=${accessToken}`;
    const catalogRes = await fetch(catalogUrl);
    const catalogData = await catalogRes.json();

    if (catalogData.error) {
      console.error('❌ Error fetching catalog:', catalogData.error.message);
      process.exit(1);
    }

    console.log('📦 الكتالوج:', catalogData.name);
    console.log('📊 عدد المنتجات:', catalogData.product_count || 0);
    console.log('🏷️ النوع:', catalogData.vertical || 'N/A');

    // Get products
    const productsUrl = `https://graph.facebook.com/v21.0/${catalogId}/products?fields=id,name,price,availability,condition,image_url&limit=100&access_token=${accessToken}`;
    const productsRes = await fetch(productsUrl);
    const productsData = await productsRes.json();

    if (productsData.error) {
      console.error('❌ Error fetching products:', productsData.error.message);
    } else {
      console.log('\n✅ المنتجات في الكتالوج:', productsData.data?.length || 0);
      
      if (productsData.data && productsData.data.length > 0) {
        console.log('\n📋 أول 5 منتجات:');
        productsData.data.slice(0, 5).forEach((product: any, index: number) => {
          console.log(`\n${index + 1}. ${product.name || 'No name'}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   السعر: ${product.price || 'N/A'}`);
          console.log(`   متاح: ${product.availability || 'N/A'}`);
          console.log(`   الحالة: ${product.condition || 'N/A'}`);
        });
      }

      // Check if there are more products
      if (productsData.paging?.next) {
        console.log('\n📄 يوجد المزيد من المنتجات...');
      }
    }

    // Get catalog diagnostics (if available)
    try {
      const diagnosticsUrl = `https://graph.facebook.com/v21.0/${catalogId}/diagnostics?access_token=${accessToken}`;
      const diagnosticsRes = await fetch(diagnosticsUrl);
      const diagnosticsData = await diagnosticsRes.json();

      if (!diagnosticsData.error && diagnosticsData.data) {
        console.log('\n🩺 التشخيصات:');
        console.log(JSON.stringify(diagnosticsData.data, null, 2));
      }
    } catch (e) {
      // Diagnostics might not be available
    }

    console.log('\n✅ الفحص اكتمل!');
    console.log('\n📊 الخطوات التالية:');
    console.log('1. إذا كان عدد المنتجات < 50، قد تحتاج لرفع الـ CSV');
    console.log('2. تحقق من Match Rate في Commerce Manager');
    console.log('3. انتظر 15-30 دقيقة بعد الرفع');
    console.log('4. يمكنك إنشاء Dynamic Product Ads الآن! 🚀');

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  }
}

checkCatalogStatus().catch(console.error);
