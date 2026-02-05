import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/sub-users - List all sub-users for vendor
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

    const subUsers = await prisma.subUser.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subUsers);
  } catch (error) {
    console.error("Failed to fetch sub-users:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

// POST /api/sub-users - Create new sub-user
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, password, phone, role, permissions } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubUser = await prisma.subUser.findUnique({
      where: { email },
    });

    if (existingSubUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create sub-user
    const subUser = await prisma.subUser.create({
      data: {
        vendorId: vendor.id,
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role || "CASHIER",
        permissions: permissions || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(subUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create sub-user:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
