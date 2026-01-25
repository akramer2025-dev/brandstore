import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "DELIVERY_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { inspectionResult, inspectionNotes } = await req.json();

    if (!["ACCEPTED", "REJECTED"].includes(inspectionResult)) {
      return NextResponse.json(
        { error: "Invalid inspection result" },
        { status: 400 }
      );
    }

    // Get the order with items
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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "OUT_FOR_DELIVERY") {
      return NextResponse.json(
        { error: "Order is not out for delivery" },
        { status: 400 }
      );
    }

    // Update order based on inspection result
    if (inspectionResult === "ACCEPTED") {
      // Accept order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: "DELIVERED",
          inspectionResult: "ACCEPTED",
          inspectionNotes,
          paymentStatus: "PAID",
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
                  images: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(updatedOrder);
    } else {
      // Reject order - return items to inventory
      await prisma.$transaction(async (tx: any) => {
        // Return each item to inventory
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

          // Log inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: "ADJUSTMENT",
              quantity: item.quantity,
              reason: `إرجاع من طلب مرفوض #${order.orderNumber}`,
              performedBy: session.user.id,
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id },
          data: {
            status: "RETURNED",
            inspectionResult: "REJECTED",
            inspectionNotes,
            paymentStatus: "CANCELLED",
          },
        });
      });

      // Fetch updated order
      const updatedOrder = await prisma.order.findUnique({
        where: { id },
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
                  images: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(updatedOrder);
    }
  } catch (error: any) {
    console.error("Error processing inspection:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process inspection" },
      { status: 500 }
    );
  }
}
