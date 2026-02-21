import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMediaBuyerAccount() {
  try {
    console.log('🎓 إنشاء حساب Media Buyer...\n');

    // البيانات
    const email = 'mediabuyer@brandstore.com';
    const password = 'MediaBuyer2026!';
    const name = 'أحمد محمد';

    // تحقق من وجود الحساب
    let user = await prisma.user.findUnique({
      where: { email },
      include: { marketingStaff: true }
    });

    if (user) {
      console.log('✅ الحساب موجود بالفعل');
      console.log('📧 البريد:', user.email);
      console.log('👤 الاسم:', user.name);
      console.log('🎯 الدور:', user.role);
      
      // تحديث الـ role إذا كان مختلف
      if (user.role !== 'MARKETING_STAFF') {
        console.log('\n🔄 تحديث الدور إلى MARKETING_STAFF...');
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'MARKETING_STAFF' }
        });
        console.log('✅ تم تحديث الدور');
      }

      // إنشاء Marketing Staff record إذا لم يكن موجود
      if (!user.marketingStaff) {
        console.log('\n📝 إنشاء سجل Marketing Staff...');
        const staff = await prisma.marketingStaff.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '01234567890',
            commissionRate: 5,
            isActive: true,
            isApproved: true,
          }
        });
        console.log('✅ تم إنشاء سجل Marketing Staff:', staff.id);
      } else {
        console.log('✅ سجل Marketing Staff موجود:', user.marketingStaff.id);
      }
    } else {
      // إنشاء حساب جديد
      console.log('📝 إنشاء حساب جديد...');
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: '+201234567890',
          role: 'MARKETING_STAFF',
          marketingStaff: {
            create: {
              name,
              email,
              phone: '+201234567890',
              commissionRate: 5,
              isActive: true,
              isApproved: true,
            }
          }
        },
        include: { marketingStaff: true }
      });

      console.log('✅ تم إنشاء الحساب بنجاح!');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ بيانات تسجيل الدخول:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 البريد الإلكتروني:', email);
    console.log('🔑 كلمة المرور:', password);
    console.log('🌐 الرابط: http://localhost:3000/marketing-staff/training');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMediaBuyerAccount();
