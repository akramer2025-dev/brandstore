import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// تحديث حالة الشحنة
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      orderId, 
      bustaStatus, 
      bustaShipmentId, 
      bustaNotes, 
      bustaTrackingUrl 
    } = body;

    if (!orderId || !bustaStatus) {
      return NextResponse.json({ 
        error: "معرف الطلب وحالة الشحنة مطلوبان" 
      }, { status: 400 });
    }

    // تحديث الطلب
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        bustaStatus: bustaStatus as any,
        bustaShipmentId: bustaShipmentId || undefined,
        bustaNotes,
        bustaTrackingUrl,
        updatedAt: new Date(),
        // تحديث حالة الطلب الرئيسية حسب حالة الشحنة
        ...(bustaStatus === "DELIVERED" && { 
          status: "DELIVERED", 
          paymentStatus: "PAID" 
        }),
        ...(bustaStatus === "RETURNED" && { 
          status: "CANCELLED" 
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث حالة الشحنة بنجاح",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating shipping status:", error);
    return NextResponse.json(
      { error: "فشل في تحديث حالة الشحنة" },
      { status: 500 }
    );
  }
}