import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/vendors/list
 * جلب جميع البائعين (للإدارة فقط)
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

    // جلب جميع البائعين
    const vendors = await prisma.vendor.findMany({
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
            partners: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // تنسيق البيانات
    const formattedVendors = vendors.map((vendor) => ({
      id: vendor.id,
      businessName: vendor.businessName,
      storeName: vendor.storeName,
      userName: vendor.user.name,
      email: vendor.user.email,
      phone: vendor.phone,
      isActive: vendor.isActive,
      isSuspended: vendor.isSuspended,
      isApproved: vendor.isApproved,
      rating: vendor.rating,
      commissionRate: vendor.commissionRate,
      capitalBalance: vendor.capitalBalance,
      productsCount: vendor._count.products,
      ordersCount: vendor._count.orders,
      partnersCount: vendor._count.partners,
      createdAt: vendor.createdAt,
    }));

    return NextResponse.json({
      vendors: formattedVendors,
      totalCount: vendors.length,
      activeCount: vendors.filter((v) => v.isActive && !v.isSuspended).length,
    });
  } catch (error) {
    console.error('Error fetching vendors list:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب قائمة البائعين' },
      { status: 500 }
    );
  }
}
