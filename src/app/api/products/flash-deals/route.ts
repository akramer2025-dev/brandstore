import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const flashDeals = await prisma.product.findMany({
      where: {
        isFlashDeal: true,
        isActive: true,
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
        category: {
          select: {
            id: true,
            nameAr: true,
            name: true,
          },
        },
      },
      orderBy: {
        soldCount: 'desc',
      },
      take: 8,
    });

    // Filter by end date if the field exists
    const now = new Date();
    const activeDeals = flashDeals.filter(product => {
      // If flashDealEndsAt exists and is a date, check if it's still valid
      if (product.flashDealEndsAt) {
        return new Date(product.flashDealEndsAt) > now;
      }
      // If no end date, include it anyway
      return true;
    });

    return NextResponse.json(activeDeals);
  } catch (error: any) {
    console.error("Error fetching flash deals:", error);
    
    // Return empty array instead of error to prevent UI crash
    return NextResponse.json([]);
  }
}
