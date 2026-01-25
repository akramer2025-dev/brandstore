import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get low stock notifications for user's wishlist
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const LOW_STOCK_THRESHOLD = 5; // عدد القطع الذي نعتبره مخزون منخفض

    const notifications = await prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id,
        notifyOnLowStock: true,
        product: {
          stock: {
            lte: LOW_STOCK_THRESHOLD,
            gt: 0, // ليس نفاذ تماماً
          },
          isActive: true,
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        product: {
          stock: 'asc', // الأقل مخزوناً أولاً
        },
      },
    });

    return NextResponse.json({
      count: notifications.length,
      notifications: notifications.map(item => ({
        id: item.id,
        product: item.product,
        stock: item.product.stock,
        message: `الكمية المتبقية من ${item.product.nameAr} هي ${item.product.stock} قطع فقط!`,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "فشل في جلب التنبيهات" },
      { status: 500 }
    );
  }
}
