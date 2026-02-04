import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const productId = id;

    // التحقق من وجود المنتج
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    // تحديث المنتج
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        price: body.price,
        stock: body.stock,
        images: body.images,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error);
    return NextResponse.json(
      { error: "فشل تحديث المنتج" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = id;

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من وجود طلبات مرتبطة
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderItemsCount > 0) {
      // إذا كان المنتج له طلبات، نجعله غير نشط بدلاً من الحذف
      await prisma.product.update({
        where: { id: productId },
        data: {
          isActive: false,
          stock: 0,
        },
      });
      
      return NextResponse.json(
        { 
          message: "تم إلغاء تفعيل المنتج (له طلبات سابقة)",
          deactivated: true,
          success: true
        },
        { status: 200 }
      );
    }

    // حذف جميع العلاقات المرتبطة بالمنتج أولاً ثم المنتج
    await prisma.$transaction([
      // حذف التقييمات
      prisma.review.deleteMany({
        where: { productId },
      }),
      // حذف من قوائم الأمنيات
      prisma.wishlistItem.deleteMany({
        where: { productId },
      }),
      // حذف قطع القماش المرتبطة
      prisma.fabricPiece.deleteMany({
        where: { productId },
      }),
      // حذف الإنتاج المرتبط
      prisma.production.deleteMany({
        where: { productId },
      }),
      // حذف المنتج نفسه
      prisma.product.delete({
        where: { id: productId },
      }),
    ]);

    return NextResponse.json(
      { 
        message: "تم حذف المنتج بنجاح",
        deleted: true,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error);
    return NextResponse.json(
      { 
        error: "فشل حذف المنتج", 
        details: error instanceof Error ? error.message : "خطأ غير معروف",
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await prisma.product.findUnique(
      where: { id },
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("خطأ في جلب المنتج:", error);
    return NextResponse.json(
      { error: "فشل جلب المنتج" },
      { status: 500 }
    );
  }
}
