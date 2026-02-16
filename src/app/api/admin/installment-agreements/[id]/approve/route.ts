import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const agreementId = resolvedParams.id;

    // Get the agreement
    const agreement = await prisma.installmentAgreement.findUnique({
      where: { id: agreementId },
      include: {
        order: true,
      },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: "الاتفاقية غير موجودة" },
        { status: 404 }
      );
    }

    // Update agreement status
    await prisma.installmentAgreement.update({
      where: { id: agreementId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
    });

    // If there's an order, update its status
    if (agreement.orderId) {
      await prisma.order.update({
        where: { id: agreement.orderId },
        data: {
          status: "CONFIRMED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تمت الموافقة على الاتفاقية بنجاح",
    });
  } catch (error) {
    console.error("Error approving agreement:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الموافقة على الاتفاقية" },
      { status: 500 }
    );
  }
}
