import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DELETE - إلغاء/إنهاء عرض خاطف
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالدخول' },
        { status: 401 }
      );
    }

    // التحقق من أن المستخدم تاجر
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'يجب أن تكون تاجراً لإلغاء العرض الخاطف' },
        { status: 403 }
      );
    }

    // التحقق من أن المنتج ينتمي للتاجر
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
        isFlashDeal: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود أو لا يحتوي على عرض خاطف' },
        { status: 404 }
      );
    }

    // إلغاء العرض الخاطف
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        isFlashDeal: false,
        flashDealStartsAt: null,
        flashDealEndsAt: null,
        flashDealPrice: null,
        flashDealStock: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء العرض الخاطف بنجاح',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error cancelling flash deal:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إلغاء العرض الخاطف' },
      { status: 500 }
    );
  }
}

// PATCH - تمديد عرض خاطف
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالدخول' },
        { status: 401 }
      );
    }

    // التحقق من أن المستخدم تاجر
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'يجب أن تكون تاجراً لتمديد العرض الخاطف' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { additionalHours } = body;

    if (!additionalHours || additionalHours <= 0) {
      return NextResponse.json(
        { error: 'يجب إدخال عدد ساعات التمديد' },
        { status: 400 }
      );
    }

    // التحقق من أن المنتج ينتمي للتاجر
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
        isFlashDeal: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود أو لا يحتوي على عرض خاطف' },
        { status: 404 }
      );
    }

    // تمديد العرض
    const currentEndDate = product.flashDealEndsAt || new Date();
    const newEndDate = new Date(currentEndDate.getTime() + additionalHours * 60 * 60 * 1000);

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        flashDealEndsAt: newEndDate
      }
    });

    return NextResponse.json({
      success: true,
      message: `تم تمديد العرض الخاطف لـ ${additionalHours} ساعة إضافية`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error extending flash deal:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تمديد العرض الخاطف' },
      { status: 500 }
    );
  }
}
