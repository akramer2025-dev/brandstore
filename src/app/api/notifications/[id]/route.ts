import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { isRead, source } = await request.json();
    const notificationId = params.id;

    if (source === 'vendor') {
      await prisma.vendorNotification.update({
        where: { id: notificationId },
        data: { isRead },
      });
    } else if (source === 'customer') {
      await prisma.customerNotification.update({
        where: { id: notificationId },
        data: { isRead },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الإشعار بنجاح",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "خطأ في تحديث الإشعار" },
      { status: 500 }
    );
  }
}
