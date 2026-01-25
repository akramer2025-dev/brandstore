import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get delivery staff record
    const deliveryStaff = await prisma.deliveryStaff.findUnique({
      where: { userId: session.user.id },
    });

    if (!deliveryStaff) {
      return NextResponse.json(
        { error: "Delivery staff not found" },
        { status: 404 }
      );
    }

    // Get all orders assigned to this delivery staff
    const orders = await prisma.order.findMany({
      where: {
        deliveryStaffId: deliveryStaff.id,
      },
      include: {
        customer: {
          select: {
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                nameAr: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching delivery orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
