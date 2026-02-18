import { prisma } from './src/lib/prisma';

async function checkVendorCustomization() {
  try {
    // جلب جميع الشركاء
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        businessName: true,
        storeNameAr: true,
        logo: true,
        coverImage: true,
        storeBio: true,
        storeBioAr: true,
        storeThemeColor: true,
        facebookUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`\n✅ تم العثور على ${vendors.length} شريك:\n`);

    vendors.forEach((vendor, index) => {
      console.log(`\n${index + 1}. ${vendor.storeNameAr || vendor.businessName}`);
      console.log(`   ID: ${vendor.id}`);
      console.log(`   البريد: ${vendor.user?.email}`);
      console.log(`   صورة الغلاف: ${vendor.coverImage ? '✅ موجودة' : '❌ غير موجودة'}`);
      if (vendor.coverImage) {
        console.log(`      URL: ${vendor.coverImage.substring(0, 60)}...`);
      }
      console.log(`   الشعار: ${vendor.logo ? '✅ موجود' : '❌ غير موجود'}`);
      if (vendor.logo) {
        console.log(`      URL: ${vendor.logo.substring(0, 60)}...`);
      }
      console.log(`   النبذة (عربي): ${vendor.storeBioAr ? '✅ موجودة' : '❌ غير موجودة'}`);
      console.log(`   النبذة (إنجليزي): ${vendor.storeBio ? '✅ موجودة' : '❌ غير موجودة'}`);
      console.log(`   لون الثيم: ${vendor.storeThemeColor || '❌ غير محدد'}`);
      console.log(`   روابط التواصل:`);
      console.log(`      - فيسبوك: ${vendor.facebookUrl ? '✅' : '❌'}`);
      console.log(`      - إنستجرام: ${vendor.instagramUrl ? '✅' : '❌'}`);
      console.log(`      - تويتر: ${vendor.twitterUrl ? '✅' : '❌'}`);
      console.log(`      - يوتيوب: ${vendor.youtubeUrl ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVendorCustomization();
