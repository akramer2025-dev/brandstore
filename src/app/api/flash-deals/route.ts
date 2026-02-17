import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - جلب جميع العروض الخاطفة النشطة (للعملاء)
export async function GET(request: Request) {
  try {
    const now = new Date();

    const flashDeals = await prisma.product.findMany({
      where: {
        isFlashDeal: true,
        isActive: true,
        isVisible: true,
        flashDealStartsAt: { lte: now },
        flashDealEndsAt: { gte: now },
        flashDealStock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        price: true,
        originalPrice: true,
        flashDealPrice: true,
        flashDealEndsAt: true,
        flashDealStock: true,
        stock: true,
        images: true,
        soldCount: true,
        viewCount: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            nameAr: true
          }
        },
        vendor: {
          select: {
            storeName: true,
            storeNameAr: true
          }
        }
      },
      orderBy: {
        flashDealEndsAt: 'asc' // الأقرب للانتهاء أولاً
      },
      take: 50 // حد أقصى 50 عرض خاطف
    });

    // حساب نسبة الخصم لكل منتج
    const flashDealsWithDiscount = flashDeals.map(product => {
      const originalPrice = product.price;
      const flashPrice = product.flashDealPrice || product.price;
      const discountPercentage = Math.round(((originalPrice - flashPrice) / originalPrice) * 100);

      return {
        ...product,
        discountPercentage,
        timeRemaining: product.flashDealEndsAt ? 
          Math.max(0, new Date(product.flashDealEndsAt).getTime() - now.getTime()) : 0
      };
    });

    return NextResponse.json({
      success: true,
      flashDeals: flashDealsWithDiscount,
      count: flashDealsWithDiscount.length,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب العروض الخاطفة' },
      { status: 500 }
    );
  }
}
