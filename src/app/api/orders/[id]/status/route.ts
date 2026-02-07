import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCommissionsForOrder } from "@/lib/marketing-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const resolvedParams = await params;

    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // حساب العمولات تلقائياً عند إتمام الطلب
    if (status === "DELIVERED") {
      const commissionResult = await calculateCommissionsForOrder(order.id);
      
      if (commissionResult.success && commissionResult.commissionsCreated && commissionResult.commissionsCreated.length > 0) {
        console.log(`✅ تم حساب ${commissionResult.commissionsCreated.length} عمولة للطلب ${order.id}`);
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
