import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const role = session.user.role;
    let notifications: any[] = [];

    // جلب إشعارات الشركاء
    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (vendor) {
        const vendorNotifications = await prisma.vendorNotification.findMany({
          where: { vendorId: vendor.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        notifications = vendorNotifications.map(n => ({
          ...n,
          source: 'vendor',
          createdAt: n.createdAt.toISOString(),
        }));
      }
    }
    
    // جلب إشعارات العملاء
    if (role === 'CUSTOMER' || !role) {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (customer) {
        const customerNotifications = await prisma.customerNotification.findMany({
          where: { customerId: customer.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        notifications = customerNotifications.map(n => ({
          ...n,
          source: 'customer',
          createdAt: n.createdAt.toISOString(),
        }));
      }
    }

    // فرز الإشعارات حسب التاريخ (الأحدث أولاً)
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "خطأ في جلب الإشعارات" },
      { status: 500 }
    );
  }
}
