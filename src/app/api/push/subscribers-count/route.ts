import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// جلب عدد المشتركين
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const count = await prisma.pushSubscription.count();

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching subscribers count:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
