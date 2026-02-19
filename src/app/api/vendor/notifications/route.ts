import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - جلب إشعارات الشريك
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // جلب الإشعارات مع ترتيبها حسب الأحدث
    const notifications = await prisma.vendorNotification.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // آخر 50 إشعار
    });

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = await prisma.vendorNotification.count({
      where: {
        vendorId: vendor.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH - تحديث حالة قراءة الإشعار
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { notificationId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      // تحديد جميع الإشعارات كمقروءة
      await prisma.vendorNotification.updateMany({
        where: {
          vendorId: vendor.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (notificationId) {
      // تحديد إشعار محدد كمقروء
      const notification = await prisma.vendorNotification.findFirst({
        where: {
          id: notificationId,
          vendorId: vendor.id,
        },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      await prisma.vendorNotification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - حذف الإشعارات
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { notificationId, deleteAll } = await request.json();

    if (deleteAll) {
      // حذف جميع الإشعارات
      await prisma.vendorNotification.deleteMany({
        where: { vendorId: vendor.id },
      });

      return NextResponse.json({ message: "All notifications deleted" });
    }

    if (notificationId) {
      // حذف إشعار محدد
      const notification = await prisma.vendorNotification.findFirst({
        where: {
          id: notificationId,
          vendorId: vendor.id,
        },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      await prisma.vendorNotification.delete({
        where: { id: notificationId },
      });

      return NextResponse.json({ message: "Notification deleted" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
