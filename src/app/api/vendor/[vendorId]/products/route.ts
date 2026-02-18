import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { vendorId } = params;

    // جلب معلومات الشريك
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // جلب منتجات الشريك النشطة فقط
    const products = await prisma.product.findMany({
      where: {
        vendorId: vendorId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            nameAr: true,
            name: true,
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [
        { isFlashDeal: 'desc' },
        { soldCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // حساب متوسط تقييم المنتجات
    const productRatings = await Promise.all(
      products.map(async (product) => {
        const reviews = await prisma.review.findMany({
          where: { productId: product.id },
          select: { rating: true },
        });
        
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        
        return {
          productId: product.id,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        };
      })
    );

    // إضافة التقييمات للمنتجات
    const productsWithRatings = products.map((product) => {
      const ratingData = productRatings.find(r => r.productId === product.id);
      return {
        ...product,
        rating: ratingData?.avgRating || 0,
        reviewCount: ratingData?.reviewCount || 0,
      };
    });

    // تنسيق معلومات الشريك
    const vendorInfo = {
      id: vendor.id,
      storeName: vendor.storeName,
      storeNameAr: vendor.storeNameAr,
      businessName: vendor.businessName,
      logo: vendor.logo,
      coverImage: vendor.coverImage,
      storeBio: vendor.storeBio,
      storeBioAr: vendor.storeBioAr,
      storeThemeColor: vendor.storeThemeColor,
      facebookUrl: vendor.facebookUrl,
      instagramUrl: vendor.instagramUrl,
      twitterUrl: vendor.twitterUrl,
      youtubeUrl: vendor.youtubeUrl,
      description: vendor.description,
      isActive: vendor.isActive,
      rating: vendor.rating,
      totalProducts: vendor._count.products,
      totalOrders: vendor._count.orders,
      userName: vendor.user?.name,
    };

    return NextResponse.json({
      vendor: vendorInfo,
      products: productsWithRatings,
      totalProducts: productsWithRatings.length,
    });

  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
