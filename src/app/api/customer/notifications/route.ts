import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get customer notifications
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // جلب جميع الإشعارات للعميل
    const notifications = await prisma.customerNotification.findMany({
      where: {
        customerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // آخر 50 إشعار
    });

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching customer notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification as read
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    // التحقق من ملكية الإشعار للعميل
    const notification = await prisma.customerNotification.findFirst({
      where: {
        id: notificationId,
        customerId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // تحديث حالة الإشعار إلى مقروء
    const updatedNotification = await prisma.customerNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
