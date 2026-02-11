import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * حذف طلب (Soft Delete)
 * ملاحظة: لا يتم حذف الطلب فعلياً، بل يتم تعليمه كمحذوف
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await context.params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // التحقق من صلاحيات الحذف
    let canDelete = false;
    let vendorId: string | null = null;

    if (session.user.role === "ADMIN" || session.user.role === "DEVELOPER") {
      canDelete = true;
    } else if (session.user.role === "VENDOR") {
      // التحقق من أن الشريك لديه صلاحية حذف الطلبات
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true, canDeleteOrders: true },
      });

      if (vendor?.canDeleteOrders) {
        canDelete = true;
        vendorId = vendor.id;
      }
    } else if (session.user.role === "PARTNER") {
      // التحقق من أن المستخدم مرتبط بشريك
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          partnerId: true
        },
      });

      if (user?.partnerId) {
        // جلب بيانات الشريك Partner ثم Vendor
        const partner = await prisma.partnerCapital.findUnique({
          where: { id: user.partnerId },
          select: { 
            vendorId: true
          }
        });

        if (partner?.vendorId) {
          // جلب بيانات Vendor للتحقق من الصلاحيات
          const vendor = await prisma.vendor.findUnique({
            where: { id: partner.vendorId },
            select: {
              id: true,
              canDeleteOrders: true
            }
          });

          if (vendor?.canDeleteOrders) {
            canDelete = true;
            vendorId = vendor.id;
          }
        }
      }
    }

    if (!canDelete) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية حذف الطلبات" },
        { status: 403 }
      );
    }

    // التحقق من وجود الطلب
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من أن الطلب غير محذوف مسبقاً
    if (order.deletedAt) {
      return NextResponse.json(
        { error: "الطلب محذوف بالفعل" },
        { status: 400 }
      );
    }

    // إذا كان الطالب شريك (VENDOR)، التحقق من أن الطلب يخصه
    if (vendorId && order.vendorId !== vendorId) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية حذف هذا الطلب" },
        { status: 403 }
      );
    }

    // الحصول على سبب الحذف من الطلب
    const body = await request.json().catch(() => ({}));
    const deletedReason = body.reason || "تم الحذف بواسطة المدير";

    // Soft Delete - تعليم الطلب كمحذوف
    const deletedOrder = await prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id,
        deletedReason: deletedReason,
      },
    });

    return NextResponse.json({
      message: "تم حذف الطلب بنجاح",
      order: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "فشل حذف الطلب" },
      { status: 500 }
    );
  }
}

/**
 * استرجاع طلب محذوف
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await context.params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // فقط المدير يستطيع استرجاع الطلبات المحذوفة
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية استرجاع الطلبات" },
        { status: 403 }
      );
    }

    // التحقق من وجود الطلب
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من أن الطلب محذوف
    if (!order.deletedAt) {
      return NextResponse.json(
        { error: "الطلب غير محذوف" },
        { status: 400 }
      );
    }

    // استرجاع الطلب
    const restoredOrder = await prisma.order.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
        deletedReason: null,
      },
    });

    return NextResponse.json({
      message: "تم استرجاع الطلب بنجاح",
      order: restoredOrder,
    });
  } catch (error) {
    console.error("Error restoring order:", error);
    return NextResponse.json(
      { error: "فشل استرجاع الطلب" },
      { status: 500 }
    );
  }
}
