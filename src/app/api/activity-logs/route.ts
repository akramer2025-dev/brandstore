import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/activity-logs - List activity logs for vendor
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Get vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "البائع غير موجود" }, { status: 404 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const date = searchParams.get("date");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {
      vendorId: vendor.id,
    };

    if (action) {
      where.action = action;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (search) {
      where.OR = [
        { details: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
      ];
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

// POST /api/activity-logs - Create new activity log
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "البائع غير موجود" }, { status: 404 });
    }

    const body = await request.json();
    const { action, details, ipAddress } = body;

    if (!action) {
      return NextResponse.json({ error: "نوع العملية مطلوب" }, { status: 400 });
    }

    const log = await prisma.activityLog.create({
      data: {
        vendorId: vendor.id,
        action,
        details: details || null,
        userName: session.user.name || "مستخدم",
        userRole: session.user.role || "VENDOR",
        ipAddress: ipAddress || null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity log:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
