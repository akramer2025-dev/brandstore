import { PrismaClient } from '@prisma/client';

// استخدام production database URL
const DATABASE_URL = "postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function enableOfflineProducts() {
  try {
    console.log('🔧 تفعيل صلاحية البضاعة الخارجية على قاعدة Production...\n');

    const emails = ['nada@gmail.com', 'radwa@gmail.com'];

    for (const email of emails) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { vendor: true },
      });

      if (!user) {
        console.log(`❌ المستخدم ${email} غير موجود`);
        continue;
      }

      if (!user.vendor) {
        console.log(`❌ ${email} ليس لديه حساب شريك`);
        continue;
      }

      await prisma.vendor.update({
        where: { id: user.vendor.id },
        data: { canAddOfflineProducts: true },
      });

      console.log(`✅ تم تفعيل صلاحية البضاعة الخارجية لـ ${email}`);
    }

    console.log('\n✅ تم تفعيل الصلاحية بنجاح على Production!');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableOfflineProducts();
