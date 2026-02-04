import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'akram@gmail.com' },
      include: { vendor: true },
    });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      return;
    }

    console.log('👤 معلومات المستخدم:');
    console.log('- الاسم:', user.name);
    console.log('- البريد:', user.email);
    console.log('- الدور:', user.role);
    console.log('- الهاتف:', user.phone);
    
    if (user.vendor) {
      console.log('\n💼 حساب الشريك موجود:');
      console.log('- ID:', user.vendor.id);
      console.log('- رأس المال:', user.vendor.capitalBalance);
      console.log('- الحالة:', user.vendor.isApproved ? 'مفعل' : 'غير مفعل');
    } else {
      console.log('\n⚠️  حساب الشريك غير موجود - سيتم إنشاؤه...');
      
      await prisma.vendor.create({
        data: {
          userId: user.id,
          phone: user.phone || '01000000000',
          address: 'القاهرة، مصر',
          capitalBalance: 0,
          isApproved: true,
        },
      });
      
      console.log('✅ تم إنشاء حساب الشريك بنجاح!');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
