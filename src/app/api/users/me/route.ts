import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/users/me - Get current user details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        vendor: {
          select: {
            storeName: true,
            storeDescription: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Flatten vendor data
    const result = {
      ...user,
      storeName: user.vendor?.storeName || "",
      storeDescription: user.vendor?.storeDescription || "",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

// PATCH /api/users/me - Update current user details
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, storeName, storeDescription } = body;

    // Check if email is being changed and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 }
        );
      }
    }

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
      },
    });

    // Update vendor info if exists
    if (storeName !== undefined || storeDescription !== undefined) {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
      });

      if (vendor) {
        await prisma.vendor.update({
          where: { userId: session.user.id },
          data: {
            ...(storeName !== undefined && { storeName }),
            ...(storeDescription !== undefined && { storeDescription }),
          },
        });
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
