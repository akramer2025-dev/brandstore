import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupMediaBuyerAccount() {
  try {
    console.log('🎓 إعداد حساب Media Buyer...\n');

    const email = 'akramit@gmail.com';
    const password = 'Aa123456';
    const name = 'أكرم - Media Buyer';

    // حذف الحساب القديم إن كان موجود
    const oldUser = await prisma.user.findUnique({
      where: { email: 'mediabuyer@brandstore.com' },
      include: { marketingStaff: true }
    });

    if (oldUser?.marketingStaff) {
      console.log('🗑️ حذف السجل القديم...');
      await prisma.marketingStaff.delete({
        where: { id: oldUser.marketingStaff.id }
      });
    }

    if (oldUser) {
      await prisma.user.delete({
        where: { id: oldUser.id }
      });
      console.log('✅ تم حذف الحساب القديم\n');
    }

    // التحقق من الحساب الجديد
    let user = await prisma.user.findUnique({
      where: { email },
      include: { marketingStaff: true }
    });

    if (user) {
      console.log('📝 تحديث الحساب الموجود...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          role: 'MARKETING_STAFF'
        },
        include: { marketingStaff: true }
      });

      // إنشاء Marketing Staff إن مش موجود
      if (!user.marketingStaff) {
        await prisma.marketingStaff.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '01000000000',
            commissionRate: 5,
            isActive: true,
            isApproved: true,
          }
        });
        console.log('✅ تم إنشاء سجل Marketing Staff');
      }
    } else {
      console.log('📝 إنشاء حساب جديد...');
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: '01000000000',
          role: 'MARKETING_STAFF',
          marketingStaff: {
            create: {
              name,
              email,
              phone: '01000000000',
              commissionRate: 5,
              isActive: true,
              isApproved: true,
            }
          }
        }
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ تم إعداد الحساب بنجاح!');
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

setupMediaBuyerAccount();
