import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmailAccount() {
  try {
    console.log('🔍 البحث عن الحساب المرتبط بالبريد: na2699512@gmail.com\n');

    const user = await prisma.user.findUnique({
      where: {
        email: 'na2699512@gmail.com'
      },
      include: {
        vendor: {
          include: {
            partners: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ لم يتم العثور على حساب بهذا البريد');
      return;
    }

    console.log('✅ تم العثور على الحساب:\n');
    console.log('📧 البريد الإلكتروني:', user.email);
    console.log('👤 الاسم:', user.name);
    console.log('🔑 الدور:', user.role);
    console.log('📅 تاريخ الإنشاء:', user.createdAt);
    console.log('🔐 كلمة المرور:', user.password ? 'مشفرة (bcrypt hash)' : 'غير موجودة');
    
    if (user.password) {
      console.log('💡 ملاحظة: كلمة المرور مشفرة ولا يمكن عرضها.');
      console.log('💡 يمكن إعادة تعيين كلمة المرور من خلال نظام استعادة كلمة المرور.');
    }

    if (user.vendor) {
      console.log('\n🏪 معلومات البائع:');
      console.log('   - ID:', user.vendor.id);
      console.log('   - اسم المتجر:', user.vendor.storeName);
      console.log('   - رأس المال:', user.vendor.capitalBalance);
      
      if (user.vendor.partners && user.vendor.partners.length > 0) {
        console.log('\n💰 معلومات الشريك:');
        user.vendor.partners.forEach((partner, index) => {
          console.log(`   شريك ${index + 1}:`);
          console.log('   - اسم الشريك:', partner.partnerName);
          console.log('   - رأس المال:', partner.capitalAmount);
          console.log('   - النسبة:', partner.capitalPercent + '%');
          console.log('   - حالة الشريك:', partner.isActive ? 'نشط' : 'غير نشط');
        });
      }
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailAccount();
