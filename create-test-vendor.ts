const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestVendor() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Create vendor account
    const user = await prisma.user.create({
      data: {
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: hashedPassword,
        role: 'VENDOR',
        vendor: {
          create: {
            businessName: 'متجر التجربة',
            businessNameAr: 'متجر التجربة',
            phone: '01234567890',
            address: 'عنوان تجريبي',
            isActive: true,
            isApproved: true
          }
        }
      },
      include: {
        vendor: true
      }
    });

    console.log('\n✅ تم إنشاء حساب Vendor بنجاح!\n');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: 123456');
    console.log('🏪 اسم المتجر:', user.vendor?.businessNameAr);
    console.log('\n🔗 سجل دخول من هنا:');
    console.log('https://www.remostore.net/auth/signin\n');

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('\n⚠️ الحساب موجود بالفعل!');
      console.log('📧 Email: vendor@test.com');
      console.log('🔑 Password: 123456\n');
    } else {
      console.error('❌ خطأ:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestVendor();
