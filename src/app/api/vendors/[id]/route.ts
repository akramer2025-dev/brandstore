import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = params.id;

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
        isApproved: true,
        isActive: true,
      },
      include: {
        products: {
          where: {
            isActive: true,
            isVisible: true,
          },
          take: 50,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'المتجر غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        storeDescription: vendor.storeDescription,
        address: vendor.address,
        phone: vendor.phone,
        totalSales: vendor.totalSales,
        products: vendor.products,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحميل بيانات المتجر' },
      { status: 500 }
    );
  }
}
