import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// جلب سجل الإشعارات
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const notifications = await prisma.pushNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        icon: true,
        image: true,
        url: true,
        recipientCount: true,
        successCount: true,
        failedCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
