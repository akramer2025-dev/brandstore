import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * إلغاء طلب من قبل العميل
 * يُسمح فقط إذا كان الطلب في حالة PENDING
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

    // الحصول على الطلب
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من أن الطلب يخص هذا العميل
    if (order.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية إلغاء هذا الطلب" },
        { status: 403 }
      );
    }

    // التحقق من حالة الطلب
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "لا يمكن إلغاء الطلب بعد تأكيده من التاجر" },
        { status: 400 }
      );
    }

    // الحصول على سبب الإلغاء
    const body = await request.json().catch(() => ({}));
    const cancelReason = body.reason || "طلب الإلغاء من العميل";

    // إلغاء الطلب
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        rejectionReason: cancelReason,
        updatedAt: new Date(),
      },
    });

    // إرجاع المنتجات للمخزون
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({
      message: "تم إلغاء الطلب بنجاح",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "فشل إلغاء الطلب" },
      { status: 500 }
    );
  }
}
