import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * عرض جميع البائعين (Vendors) الموجودين في النظام
 * 
 * الاستخدام:
 * npx tsx list-all-vendors.ts
 */

async function listAllVendors() {
  try {
    console.log('🔍 جاري جلب جميع البائعين...\n');

    const vendors = await prisma.vendor.findMany({
      include: {
        user: true,
        partners: {
          where: { isActive: true }
        },
        _count: {
          select: {
            products: true,
            orders: true,
            payouts: true,
            partners: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (vendors.length === 0) {
      console.log('⚠️  لا يوجد بائعين في النظام.\n');
      return;
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║          قائمة البائعين (${vendors.length} بائع)                      ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    vendors.forEach((vendor, index) => {
      const isActive = vendor.isActive ? '✅' : '❌';
      const isSuspended = vendor.isSuspended ? '🚫' : '';
      const isApproved = vendor.isApproved ? '✓' : '✗';
      
      console.log(`\n${index + 1}. ${isActive} ${vendor.businessName || vendor.storeName || vendor.user.name} ${isSuspended}`);
      console.log(`   ════════════════════════════════════════════════════════`);
      console.log(`   🆔 Vendor ID: ${vendor.id}`);
      console.log(`   👤 اسم المستخدم: ${vendor.user.name || 'غير محدد'}`);
      console.log(`   📧 البريد: ${vendor.user.email}`);
      console.log(`   📞 الهاتف: ${vendor.phone || 'غير محدد'}`);
      console.log(`   💼 نوع العمل: ${vendor.businessType || 'غير محدد'}`);
      console.log(`   ✓ موافق عليه: ${isApproved}`);
      console.log(`   📊 نشط: ${vendor.isActive ? 'نعم' : 'لا'}`);
      
      if (vendor.isSuspended) {
        console.log(`   🚫 موقوف مؤقتاً`);
        console.log(`   📝 سبب الإيقاف: ${vendor.suspensionReason || 'غير محدد'}`);
      }
      
      console.log(`   ⭐ التقييم: ${vendor.rating.toFixed(1)}/5`);
      console.log(`   💰 نسبة العمولة: ${vendor.commissionRate}%`);
      console.log(`   💵 رأس المال: ${vendor.capitalBalance.toLocaleString('ar-EG')} جنيه`);
      
      if (vendor._count.partners > 0) {
        console.log(`   👥 عدد الشركاء: ${vendor._count.partners}`);
        if (vendor.partners.length > 0) {
          vendor.partners.forEach((partner) => {
            console.log(`      - ${partner.partnerName} (${partner.capitalPercent}%)`);
          });
        }
      }
      
      console.log(`   📦 المنتجات: ${vendor._count.products}`);
      console.log(`   📋 الطلبات: ${vendor._count.orders}`);
      console.log(`   💳 المدفوعات: ${vendor._count.payouts}`);
      console.log(`   📅 تاريخ الإنشاء: ${new Date(vendor.createdAt).toLocaleDateString('ar-EG')}`);
    });

    // إحصائيات عامة
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                      إحصائيات عامة                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const activeVendors = vendors.filter(v => v.isActive && !v.isSuspended).length;
    const suspendedVendors = vendors.filter(v => v.isSuspended).length;
    const approvedVendors = vendors.filter(v => v.isApproved).length;
    const totalProducts = vendors.reduce((sum, v) => sum + v._count.products, 0);
    const totalOrders = vendors.reduce((sum, v) => sum + v._count.orders, 0);
    const totalCapital = vendors.reduce((sum, v) => sum + v.capitalBalance, 0);
    const vendorsWithPartners = vendors.filter(v => v._count.partners > 0).length;

    console.log(`📊 إجمالي البائعين: ${vendors.length}`);
    console.log(`   - نشط: ${activeVendors} ✅`);
    console.log(`   - موقوف: ${suspendedVendors} 🚫`);
    console.log(`   - موافق عليه: ${approvedVendors} ✓`);
    console.log(`   - لديه شركاء: ${vendorsWithPartners} 👥`);
    console.log(`\n📦 إجمالي المنتجات: ${totalProducts.toLocaleString('ar-EG')}`);
    console.log(`📋 إجمالي الطلبات: ${totalOrders.toLocaleString('ar-EG')}`);
    console.log(`💰 إجمالي رأس المال: ${totalCapital.toLocaleString('ar-EG')} جنيه`);

    // البائعين النشطين فقط (للنسخ السريع)
    const activeVendorsList = vendors.filter(v => v.isActive && !v.isSuspended);
    
    if (activeVendorsList.length > 0) {
      console.log('\n\n💡 البائعين النشطين (للاستخدام في النقل):');
      console.log('════════════════════════════════════════════════════════════\n');
      activeVendorsList.forEach((vendor) => {
        const name = vendor.businessName || vendor.storeName || vendor.user.name;
        console.log(`// ${name} (${vendor._count.products} منتج)`);
        console.log(`const VENDOR_ID = '${vendor.id}';\n`);
      });
    }

  } catch (error) {
    console.error('\n❌ حدث خطأ:\n');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
listAllVendors();
