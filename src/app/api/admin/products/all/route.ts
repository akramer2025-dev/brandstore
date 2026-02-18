import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/products/all
 * جلب جميع المنتجات مع بيانات البائعين (للإدارة فقط)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // التحقق من صلاحيات الإدارة
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    // جلب المعاملات من URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const vendorId = searchParams.get('vendorId') || '';
    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    // جلب المنتجات مع بيانات البائعين
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
              reviews: true,
              cartItems: true,
              wishlistItems: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    // تنسيق البيانات
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      soldCount: product.soldCount,
      images: product.images,
      category: product.category,
      vendor: product.vendor
        ? {
            id: product.vendor.id,
            businessName: product.vendor.businessName,
            storeName: product.vendor.storeName,
            isActive: product.vendor.isActive,
            isSuspended: product.vendor.isSuspended,
            user: product.vendor.user,
          }
        : null,
      stats: {
        orders: product._count.orderItems,
        reviews: product._count.reviews,
        inCart: product._count.cartItems,
        inWishlist: product._count.wishlistItems,
      },
      createdAt: product.createdAt,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
