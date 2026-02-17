import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "DEVELOPER")) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const agreementId = resolvedParams.id;

    // Get the agreement with all details
    const agreement = await prisma.installmentAgreement.findUnique({
      where: { id: agreementId },
      include: {
        user: {
          select: {
            id: true,
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
                    id: true,
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

    return NextResponse.json({
      success: true,
      agreement,
    });

  } catch (error) {
    console.error("Error fetching agreement:", error);
    
    return NextResponse.json(
      { 
        error: "حدث خطأ أثناء تحميل الاتفاقية",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}
