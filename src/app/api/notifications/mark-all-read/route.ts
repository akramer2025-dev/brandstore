import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const role = session.user.role;

    // تحديث جميع إشعارات الشركاء
    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (vendor) {
        await prisma.vendorNotification.updateMany({
          where: { 
            vendorId: vendor.id,
            isRead: false 
          },
          data: { isRead: true },
        });
      }
    }
    
    // تحديث جميع إشعارات العملاء
    if (role === 'CUSTOMER' || !role) {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (customer) {
        await prisma.customerNotification.updateMany({
          where: { 
            customerId: customer.id,
            isRead: false 
          },
          data: { isRead: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم تعليم جميع الإشعارات كمقروءة",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "خطأ في تحديث الإشعارات" },
      { status: 500 }
    );
  }
}
