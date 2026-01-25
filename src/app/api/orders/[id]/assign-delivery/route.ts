import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/order-service";

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
    const { deliveryStaffId } = body;

    if (!deliveryStaffId) {
      return NextResponse.json(
        { error: "deliveryStaffId is required" },
        { status: 400 }
      );
    }

    const resolvedParams = await params;

    const order = await OrderService.assignDeliveryStaff(
      resolvedParams.id,
      deliveryStaffId
    );

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error assigning delivery staff:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign delivery staff" },
      { status: 500 }
    );
  }
}
