import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * عرض جميع منتجات بائع معين
 * 
 * الاستخدام:
 * npx tsx list-vendor-products.ts
 */

async function listVendorProducts() {
  try {
    const VENDOR_ID = 'VENDOR_ID_HERE'; // 👈 ضع ID البائع هنا

    console.log('🔍 جاري البحث عن البائع والمنتجات...\n');

    // جلب بيانات البائع مع المنتجات
    const vendor = await prisma.vendor.findUnique({
      where: { id: VENDOR_ID },
      include: {
        user: true,
        products: {
          include: {
            category: true,
            _count: {
              select: {
                orderItems: true,
                reviews: true,
                cartItems: true,
                wishlistItems: true,
                inventoryItems: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        partners: true, // الشركاء في رأس المال
        _count: {
          select: {
            products: true,
            orders: true,
            payouts: true
          }
        }
      }
    });

    if (!vendor) {
      throw new Error('❌ البائع غير موجود!');
    }

    // عرض بيانات البائع
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                     معلومات البائع                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📌 الاسم: ${vendor.businessName || vendor.storeName || vendor.user.name}`);
    console.log(`📧 البريد: ${vendor.user.email}`);
    console.log(`📞 الهاتف: ${vendor.phone || 'غير محدد'}`);
    console.log(`💼 نوع العمل: ${vendor.businessType || 'غير محدد'}`);
    console.log(`📊 الحالة: ${vendor.isActive ? '✅ نشط' : '❌ غير نشط'}`);
    console.log(`⭐ التقييم: ${vendor.rating.toFixed(1)}/5`);
    console.log(`💰 نسبة العمولة: ${vendor.commissionRate}%`);
    console.log(`💵 رأس المال: ${vendor.capitalBalance.toLocaleString('ar-EG')} جنيه`);
    
    // عرض الشركاء إذا وجدوا
    if (vendor.partners.length > 0) {
      console.log(`\n👥 الشركاء (${vendor.partners.length}):`);
      vendor.partners.forEach((partner, index) => {
        console.log(`   ${index + 1}. ${partner.partnerName}`);
        console.log(`      - نوع الشريك: ${partner.partnerType}`);
        console.log(`      - نسبة المساهمة: ${partner.capitalPercent}%`);
        console.log(`      - المبلغ المساهم: ${partner.capitalAmount.toLocaleString('ar-EG')} جنيه`);
        console.log(`      - الحالة: ${partner.isActive ? '✅ نشط' : '❌ غير نشط'}\n`);
      });
    }

    console.log(`\n📈 الإحصائيات:`);
    console.log(`   - عدد المنتجات: ${vendor._count.products}`);
    console.log(`   - عدد الطلبات: ${vendor._count.orders}`);
    console.log(`   - عدد المدفوعات: ${vendor._count.payouts}\n`);

    // عرض المنتجات
    if (vendor.products.length === 0) {
      console.log('⚠️  لا توجد منتجات لهذا البائع.\n');
      return;
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                      قائمة المنتجات                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    vendor.products.forEach((product, index) => {
      const isActive = product.isActive ? '✅' : '❌';
      const isFeatured = product.isFeatured ? '⭐' : '';
      
      console.log(`\n${index + 1}. ${isActive} ${product.name} ${isFeatured}`);
      console.log(`   ════════════════════════════════════════════════════════`);
      console.log(`   📋 ID: ${product.id}`);
      console.log(`   📁 القسم: ${product.category.name}`);
      console.log(`   💰 السعر: ${product.price.toLocaleString('ar-EG')} جنيه`);
      
      if (product.salePrice && product.salePrice < product.price) {
        const discount = ((1 - product.salePrice / product.price) * 100).toFixed(0);
        console.log(`   🏷️  سعر البيع: ${product.salePrice.toLocaleString('ar-EG')} جنيه (خصم ${discount}%)`);
      }
      
      console.log(`   📦 الكمية المتاحة: ${product.stock || 0}`);
      console.log(`   🔢 تم البيع: ${product.soldCount || 0} قطعة`);
      console.log(`   ⭐ التقييم: ${product.averageRating?.toFixed(1) || '0.0'}/5 (${product._count.reviews} تقييم)`);
      console.log(`   🛒 في السلة: ${product._count.cartItems}`);
      console.log(`   ❤️  في المفضلة: ${product._count.wishlistItems}`);
      console.log(`   📦 الطلبات: ${product._count.orderItems}`);
      console.log(`   📊 المخزون: ${product._count.inventoryItems} عنصر`);
      console.log(`   🏷️  SKU: ${product.sku || 'غير محدد'}`);
      console.log(`   📅 تاريخ الإضافة: ${new Date(product.createdAt).toLocaleDateString('ar-EG')}`);
      
      if (product.description) {
        const shortDesc = product.description.substring(0, 80);
        console.log(`   📝 الوصف: ${shortDesc}${product.description.length > 80 ? '...' : ''}`);
      }
    });

    // ملخص سريع
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                        ملخص سريع                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const activeProducts = vendor.products.filter(p => p.isActive).length;
    const inactiveProducts = vendor.products.length - activeProducts;
    const totalStock = vendor.products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalSold = vendor.products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
    const totalOrders = vendor.products.reduce((sum, p) => sum + p._count.orderItems, 0);
    const outOfStock = vendor.products.filter(p => !p.stock || p.stock === 0).length;
    const lowStock = vendor.products.filter(p => p.stock && p.stock > 0 && p.stock < 5).length;

    console.log(`📊 إجمالي المنتجات: ${vendor.products.length}`);
    console.log(`   - منتجات نشطة: ${activeProducts} ✅`);
    console.log(`   - منتجات معطلة: ${inactiveProducts} ❌`);
    console.log(`   - نفذت من المخزون: ${outOfStock} 🔴`);
    console.log(`   - مخزون منخفض: ${lowStock} 🟡`);
    console.log(`\n💰 المبيعات:`);
    console.log(`   - إجمالي المخزون: ${totalStock.toLocaleString('ar-EG')} قطعة`);
    console.log(`   - إجمالي المباع: ${totalSold.toLocaleString('ar-EG')} قطعة`);
    console.log(`   - إجمالي الطلبات: ${totalOrders.toLocaleString('ar-EG')} طلب`);

    // عرض IDs المنتجات للاستخدام في النقل
    console.log('\n\n💡 نسخ IDs المنتجات (للاستخدام في النقل):');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log('const PRODUCT_IDS = [');
    vendor.products.forEach((product, index) => {
      const comma = index < vendor.products.length - 1 ? ',' : '';
      console.log(`  '${product.id}', // ${product.name}`);
    });
    console.log('];\n');

  } catch (error) {
    console.error('\n❌ حدث خطأ:\n');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
listVendorProducts();
