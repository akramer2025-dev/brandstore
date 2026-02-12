import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateTestPartner() {
  try {
    console.log('\n🔍 تحقيق شامل في حساب "testpartner@example.com"\n');
    console.log('═'.repeat(80));

    // 1. معلومات المستخدم
    const user = await prisma.user.findUnique({
      where: { email: 'testpartner@example.com' },
      include: {
        accounts: true, // OAuth accounts من NextAuth
        sessions: true,
        vendor: {
          include: {
            products: {
              select: {
                id: true,
                nameAr: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      return;
    }

    console.log('\n👤 معلومات المستخدم:');
    console.log(`   ID: ${user.id}`);
    console.log(`   الاسم: ${user.name}`);
    console.log(`   البريد: ${user.email}`);
    console.log(`   الدور: ${user.role}`);
    console.log(`   تاريخ الإنشاء: ${user.createdAt.toLocaleString('ar-EG')}`);
    console.log(`   آخر تحديث: ${user.updatedAt.toLocaleString('ar-EG')}`);
    console.log(`   عنده Password?: ${user.password ? '✅ نعم' : '❌ لا'}`);

    // 2. حسابات OAuth (Google, Facebook, etc)
    console.log('\n🔐 حسابات OAuth المربوطة:');
    if (user.accounts && user.accounts.length > 0) {
      user.accounts.forEach((account: any) => {
        console.log(`   ✅ ${account.provider} (${account.providerAccountId})`);
        console.log(`      Type: ${account.type}`);
      });
    } else {
      console.log('   ❌ لا توجد حسابات OAuth - تم التسجيل بالبريد والباسورد فقط');
    }

    // 3. الجلسات النشطة
    console.log('\n🌐 الجلسات:');
    if (user.sessions && user.sessions.length > 0) {
      console.log(`   عدد الجلسات: ${user.sessions.length}`);
      user.sessions.forEach((session: any, index: number) => {
        console.log(`   ${index + 1}. Session ID: ${session.sessionToken.slice(0, 20)}...`);
        console.log(`      تاريخ انتهاء الصلاحية: ${session.expires.toLocaleString('ar-EG')}`);
      });
    } else {
      console.log('   ❌ لا توجد جلسات نشطة حالياً');
    }

    // 4. المنتجات
    if (user.vendor && user.vendor.products) {
      console.log('\n📦 المنتجات المضافة:');
      console.log(`   إجمالي: ${user.vendor.products.length} منتج\n`);
      
      user.vendor.products.forEach((product: any, index: number) => {
        const daysSinceCreation = Math.floor(
          (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        console.log(`   ${index + 1}. ${product.nameAr}`);
        console.log(`      تاريخ الإضافة: ${product.createdAt.toLocaleString('ar-EG')} (منذ ${daysSinceCreation} يوم)`);
        
        if (product.updatedAt.getTime() !== product.createdAt.getTime()) {
          console.log(`      آخر تحديث: ${product.updatedAt.toLocaleString('ar-EG')}`);
        }
        console.log();
      });
    }

    // 5. تحليل النمط
    console.log('═'.repeat(80));
    console.log('\n📊 التحليل:');
    
    if (user.password) {
      console.log('   ✅ الحساب تم إنشاؤه بـ Email/Password (ليس Google OAuth)');
    }
    
    if (!user.accounts || user.accounts.length === 0) {
      console.log('   ✅ لم يتم ربط أي حساب Google أو OAuth');
    }
    
    if (user.vendor && user.vendor.products && user.vendor.products.length > 0) {
      const firstProduct = user.vendor.products[0];
      const lastProduct = user.vendor.products[user.vendor.products.length - 1];
      const daysBetween = Math.floor(
        (new Date(lastProduct.createdAt).getTime() - new Date(firstProduct.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      console.log(`   📅 المنتجات أُضيفت على مدار ${daysBetween} يوم`);
      console.log(`   📅 من ${firstProduct.createdAt.toLocaleDateString('ar-EG')} إلى ${lastProduct.createdAt.toLocaleDateString('ar-EG')}`);
    }

    console.log('\n⚠️ ملاحظة: النظام لا يسجل معلومات المتصفح أو الجهاز حالياً');
    console.log('   لتتبع هذه المعلومات، يمكن إضافة User-Agent logging في المستقبل');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateTestPartner();
