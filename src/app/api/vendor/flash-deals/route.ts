import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - جلب جميع العروض الخاطفة للتاجر
export async function GET(request: Request) {
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
        { error: 'يجب أن تكون تاجراً لعرض العروض الخاطفة' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all'; // all, active, expired, upcoming

    const now = new Date();
    let whereClause: any = {
      vendorId: vendor.id,
      isFlashDeal: true
    };

    if (status === 'active') {
      whereClause.flashDealStartsAt = { lte: now };
      whereClause.flashDealEndsAt = { gte: now };
    } else if (status === 'expired') {
      whereClause.flashDealEndsAt = { lt: now };
    } else if (status === 'upcoming') {
      whereClause.flashDealStartsAt = { gt: now };
    }

    const flashDeals = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        flashDealPrice: true,
        flashDealStartsAt: true,
        flashDealEndsAt: true,
        flashDealStock: true,
        stock: true,
        images: true,
        soldCount: true,
        viewCount: true,
        isActive: true,
        category: {
          select: {
            name: true,
            nameAr: true
          }
        }
      },
      orderBy: {
        flashDealStartsAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      flashDeals,
      count: flashDeals.length
    });
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب العروض الخاطفة' },
      { status: 500 }
    );
  }
}

// POST - إضافة عرض خاطف جديد
export async function POST(request: Request) {
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
        { error: 'يجب أن تكون تاجراً لإضافة عرض خاطف' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      productId,
      flashDealPrice,
      durationHours,
      flashDealStock,
      startsImmediately = true
    } = body;

    // التحقق من الحقول المطلوبة
    if (!productId || !flashDealPrice || !durationHours) {
      return NextResponse.json(
        { error: 'يجب إدخال معرف المنتج والسعر ومدة العرض' },
        { status: 400 }
      );
    }

    // التحقق من أن المنتج ينتمي للتاجر
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorId: vendor.id
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود أو لا ينتمي لك' },
        { status: 404 }
      );
    }

    // التحقق من السعر
    if (flashDealPrice >= product.price) {
      return NextResponse.json(
        { error: 'سعر العرض الخاطف يجب أن يكون أقل من السعر الأصلي' },
        { status: 400 }
      );
    }

    // حساب أوقات البدء والانتهاء
    const now = new Date();
    const flashDealStartsAt = startsImmediately ? now : new Date(body.startsAt || now);
    const flashDealEndsAt = new Date(flashDealStartsAt.getTime() + durationHours * 60 * 60 * 1000);

    // تحديث المنتج
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isFlashDeal: true,
        flashDealStartsAt,
        flashDealEndsAt,
        flashDealPrice,
        flashDealStock: flashDealStock || product.stock,
        originalPrice: product.originalPrice || product.price // حفظ السعر الأصلي
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة العرض الخاطف بنجاح',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error creating flash deal:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إضافة العرض الخاطف' },
      { status: 500 }
    );
  }
}
