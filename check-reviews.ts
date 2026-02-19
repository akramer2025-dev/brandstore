import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReviews() {
  try {
    const reviewCount = await prisma.review.count();
    console.log(`✅ عدد المراجعات الموجودة: ${reviewCount}`);

    const approvedCount = await prisma.review.count({
      where: { isApproved: true }
    });
    console.log(`✅ المراجعات المعتمدة: ${approvedCount}`);

    const sampleReviews = await prisma.review.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true
          }
        },
        product: {
          select: {
            nameAr: true
          }
        }
      }
    });

    console.log('\n📝 عينة من المراجعات:');
    sampleReviews.forEach(review => {
      console.log(`   - ${review.user.name}: ${review.rating}⭐ على "${review.product.nameAr}"`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReviews();
