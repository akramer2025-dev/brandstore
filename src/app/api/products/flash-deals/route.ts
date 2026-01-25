import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const flashDeals = await prisma.product.findMany({
      where: {
        isFlashDeal: true,
        isActive: true,
        flashDealEndsAt: {
          gt: new Date(), // العروض التي لم تنته بعد
        },
      },
      include: {
        reviews: {
          where: {
            isApproved: true,
          },
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        soldCount: 'desc',
      },
      take: 8, // أول 8 عروض
    });

    return NextResponse.json(flashDeals);
  } catch (error: any) {
    console.error("Error fetching flash deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flash deals" },
      { status: 500 }
    );
  }
}
