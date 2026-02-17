import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // جلب الاتفاقية - بدون التحقق من الصلاحيات (صفحة عامة)
    const agreement = await prisma.installmentAgreement.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    nameAr: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: "الاتفاقية غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({ agreement });
  } catch (error) {
    console.error("Error fetching agreement:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الاتفاقية" },
      { status: 500 }
    );
  }
}
