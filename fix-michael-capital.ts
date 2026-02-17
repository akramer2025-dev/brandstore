/**
 * 🔧 إصلاح حساب شريك بعينه - مايكل
 * 
 * هذا الملف يوضح كيفية تصفير رأس المال لشريك معين
 * إذا تم إنشاؤه قبل الإصلاح وحصل على 7500 تلقائياً
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMichaelCapital() {
  try {
    console.log('🔍 البحث عن حساب مايكل...\n');

    // البحث عن المستخدم
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'مايكل', mode: 'insensitive' } },
          { name: { contains: 'michael', mode: 'insensitive' } },
          { email: { contains: 'michael', mode: 'insensitive' } },
        ],
        role: 'VENDOR'
      },
      include: {
        vendor: {
          include: {
            partners: true,
            products: {
              select: {
                id: true,
                nameAr: true,
                price: true,
                stock: true,
                productionCost: true,
                productSource: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.vendor) {
      console.log('❌ لم يتم العثور على حساب مايكل\n');
      console.log('💡 تأكد من:');
      console.log('   - الاسم مكتوب صحيح في قاعدة البيانات');
      console.log('   - الحساب له role = VENDOR');
      console.log('   - الحساب مربوط بسجل في جدول vendors\n');
      return;
    }

    console.log('✅ تم العثور على الحساب:');
    console.log(`   👤 الاسم: ${user.name}`);
    console.log(`   📧 البريد: ${user.email}`);
    console.log(`   🆔 Vendor ID: ${user.vendor.id}\n`);

    console.log('📊 الوضع الحالي:');
    console.log(`   💰 رأس المال الأولي: ${user.vendor.initialCapital.toLocaleString()} ج`);
    console.log(`   💵 رأس المال الحالي: ${user.vendor.capitalBalance.toLocaleString()} ج`);
    console.log(`   📦 عدد المنتجات: ${user.vendor.products.length} منتج`);
    console.log(`   🤝 عدد الشركاء: ${user.vendor.partners.length} شريك\n`);

    // حساب قيمة المنتجات المملوكة
    const ownedProducts = user.vendor.products.filter(p => p.productSource === 'OWNED');
    const totalProductsValue = ownedProducts.reduce((sum, p) => {
      const cost = p.productionCost || 0;
      return sum + (cost * p.stock);
    }, 0);

    console.log('📦 تحليل المنتجات:');
    console.log(`   🏭 منتجات مملوكة: ${ownedProducts.length}`);
    console.log(`   💲 قيمة المخزون: ${totalProductsValue.toLocaleString()} ج\n`);

    // التحقق من وجود معاملات
    const capitalTransactions = await prisma.capitalLog.count({
      where: { vendorId: user.vendor.id }
    });

    const purchases = await prisma.purchase.count({
      where: { vendorId: user.vendor.id }
    });

    const sales = await prisma.sale.count({
      where: { vendorId: user.vendor.id }
    });

    console.log('📈 النشاط:');
    console.log(`   📝 معاملات رأس المال: ${capitalTransactions}`);
    console.log(`   🛒 المشتريات: ${purchases}`);
    console.log(`   💰 المبيعات: ${sales}\n`);

    // قرار الإصلاح
    console.log('⚙️ خيارات الإصلاح:\n');

    if (totalProductsValue === 0 && capitalTransactions === 0 && purchases === 0 && sales === 0) {
      // حساب جديد تماماً - تصفير آمن
      console.log('✅ الحساب جديد ولا يوجد نشاط - يمكن التصفير بأمان\n');
      
      console.log('🔧 تطبيق التصفير...');
      
      await prisma.vendor.update({
        where: { id: user.vendor.id },
        data: {
          initialCapital: 0,
          capitalBalance: 0
        }
      });

      // حذف سجلات رأس المال إن وجدت
      if (user.vendor.partners.length > 0) {
        await prisma.partnerCapital.deleteMany({
          where: { vendorId: user.vendor.id }
        });
        console.log('   ✅ تم حذف سجلات رأس المال القديمة');
      }

      console.log('   ✅ تم تصفير رأس المال الأولي → 0 ج');
      console.log('   ✅ تم تصفير رأس المال الحالي → 0 ج\n');

      console.log('✅ تم الإصلاح بنجاح!');
      console.log('💡 يمكن للشريك الآن إضافة رأس مال جديد من لوحة التحكم\n');

    } else if (totalProductsValue > 0 && user.vendor.capitalBalance === 7500) {
      // يوجد منتجات ورأس المال 7500 (غير منطقي)
      console.log('⚠️ تحذير: يوجد منتجات بقيمة', totalProductsValue.toLocaleString(), 'ج');
      console.log('   ولكن رأس المال = 7500 ج (القيمة الافتراضية القديمة)\n');
      
      console.log('📋 الخيارات:');
      console.log('   1️⃣ تصفير رأس المال وحذف المنتجات (إذا كانت تجريبية)');
      console.log('   2️⃣ تعديل رأس المال ليساوي قيمة المنتجات:', totalProductsValue, 'ج');
      console.log('   3️⃣ ترك رأس المال 7500 واعتباره رأس مال فعلي\n');

      console.log('⛔ لم يتم التعديل تلقائياً - اختر الخيار المناسب يدوياً\n');

    } else {
      // حساب نشط - لاتعديل تلقائي
      console.log('⚠️ الحساب نشط ويحتوي على معاملات');
      console.log('   لا يُنصح بتعديل رأس المال تلقائياً\n');
      
      console.log('💡 للتعديل اليدوي:');
      console.log(`   UPDATE vendors SET initialCapital = 0, capitalBalance = 0 WHERE id = '${user.vendor.id}';`);
      console.log('\n⚠️ تأكد من مراجعة المعاملات قبل التعديل!\n');
    }

    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
fixMichaelCapital();

/**
 * 📖 كيفية الاستخدام:
 * 
 * 1. للتحقق من الحالة فقط (بدون تعديل):
 *    npx ts-node fix-michael-capital.ts
 * 
 * 2. إذا كانت النتيجة "يمكن التصفير بأمان":
 *    - سيتم التصفير تلقائياً
 * 
 * 3. إذا كانت النتيجة "يوجد نشاط":
 *    - راجع الخيارات المقترحة
 *    - عدّل يدوياً حسب الحاجة
 * 
 * 4. بعد الإصلاح:
 *    - الشريك يسجل دخول
 *    - يذهب إلى /vendor/capital
 *    - يضيف رأس مال جديد من الصفر
 */
