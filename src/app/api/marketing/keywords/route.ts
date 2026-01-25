import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();

    const keyword = await prisma.seoKeyword.create({
      data: {
        keyword: body.keyword,
        searchVolume: body.searchVolume,
        difficulty: body.difficulty,
        currentRank: body.currentRank,
        targetRank: body.targetRank,
        url: body.url,
        status: body.status,
      },
    });

    return NextResponse.json(keyword);
  } catch (error) {
    console.error("Error adding keyword:", error);
    return NextResponse.json({ error: "فشل إضافة الكلمة المفتاحية" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const keywords = await prisma.seoKeyword.findMany({
      orderBy: { searchVolume: "desc" },
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json({ error: "فشل جلب الكلمات المفتاحية" }, { status: 500 });
  }
}
