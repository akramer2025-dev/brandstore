import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/products/transfer
 * نقل منتجات من بائع لبائع آخر (للإدارة فقط)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // التحقق من صلاحيات الإدارة
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productIds, fromVendorId, toVendorId } = body;

    // التحقق من البيانات المطلوبة
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'يجب تحديد منتج واحد على الأقل' },
        { status: 400 }
      );
    }

    if (!toVendorId) {
      return NextResponse.json(
        { error: 'يجب تحديد البائع الجديد' },
        { status: 400 }
      );
    }

    // التحقق من البائع الجديد
    const toVendor = await prisma.vendor.findUnique({
      where: { id: toVendorId },
      include: { user: true },
    });

    if (!toVendor) {
      return NextResponse.json(
        { error: 'البائع الجديد غير موجود' },
        { status: 404 }
      );
    }

    if (!toVendor.isActive) {
      return NextResponse.json(
        { error: 'البائع الجديد غير نشط' },
        { status: 400 }
      );
    }

    // جلب المنتجات المراد نقلها
    const productsToTransfer = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        vendor: {
          include: { user: true },
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
    });

    if (productsToTransfer.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المنتجات المحددة' },
        { status: 404 }
      );
    }

    // التحقق من البائع القديم (إذا كان محدد)
    if (fromVendorId) {
      const wrongProducts = productsToTransfer.filter(
        (p) => p.vendorId !== fromVendorId
      );
      if (wrongProducts.length > 0) {
        return NextResponse.json(
          {
            error: `بعض المنتجات لا تنتمي للبائع المحدد`,
            wrongProducts: wrongProducts.map((p) => ({
              id: p.id,
              name: p.name,
              currentVendor: p.vendor?.businessName || p.vendor?.storeName,
            })),
          },
          { status: 400 }
        );
      }
    }

    // نقل المنتجات بطريقة آمنة (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // تحديث vendorId لجميع المنتجات
      const updateResult = await tx.product.updateMany({
        where: {
          id: { in: productIds },
        },
        data: {
          vendorId: toVendorId,
        },
      });

      // تحديث المخزون
      const inventoryItems = await tx.inventoryItem.findMany({
        where: {
          productId: { in: productIds },
        },
      });

      if (inventoryItems.length > 0) {
        await tx.inventoryItem.updateMany({
          where: {
            productId: { in: productIds },
          },
          data: {
            vendorId: toVendorId,
          },
        });
      }

      // تحديث إحصائيات البائع القديم (إذا كان محدد وموجود)
      if (fromVendorId) {
        const oldVendor = await tx.vendor.findUnique({
          where: { id: fromVendorId },
        });

        if (oldVendor) {
          await tx.vendor.update({
            where: { id: fromVendorId },
            data: {
              totalSales: Math.max(0, oldVendor.totalSales - updateResult.count),
            },
          });
        }
      }

      // تحديث إحصائيات البائع الجديد
      await tx.vendor.update({
        where: { id: toVendorId },
        data: {
          totalSales: {
            increment: updateResult.count,
          },
        },
      });

      return {
        count: updateResult.count,
        inventoryUpdated: inventoryItems.length,
      };
    });

    // إعداد معلومات النقل
    const transferInfo = {
      productsCount: result.count,
      inventoryUpdated: result.inventoryUpdated,
      fromVendor: productsToTransfer[0]?.vendor
        ? {
            id: productsToTransfer[0].vendor.id,
            name:
              productsToTransfer[0].vendor.businessName ||
              productsToTransfer[0].vendor.storeName ||
              productsToTransfer[0].vendor.user.name,
          }
        : null,
      toVendor: {
        id: toVendor.id,
        name: toVendor.businessName || toVendor.storeName || toVendor.user.name,
      },
      products: productsToTransfer.map((p) => ({
        id: p.id,
        name: p.name,
        hasOrders: p._count.orderItems > 0,
        ordersCount: p._count.orderItems,
      })),
    };

    return NextResponse.json({
      success: true,
      message: `تم نقل ${result.count} منتج بنجاح`,
      data: transferInfo,
    });
  } catch (error) {
    console.error('Error transferring products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء نقل المنتجات' },
      { status: 500 }
    );
  }
}
