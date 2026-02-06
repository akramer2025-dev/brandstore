import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// جلب الطلبات الجاهزة للشحن (لم ترسل لبوسطة بعد)
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const pendingOrders = await prisma.order.findMany({
      where: {
        deliveryMethod: "HOME_DELIVERY",
        bustaStatus: null,
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING"],
        },
        deletedAt: null,
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                nameAr: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pendingOrders);
  } catch (error: any) {
    console.error("Error fetching pending shipments:", error);
    return NextResponse.json(
      { error: "فشل في جلب الطلبات" },
      { status: 500 }
    );
  }
}