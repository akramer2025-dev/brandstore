import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "VENDOR") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { 
      deliveryType, 
      agentId, 
      agentName, 
      agentPhone, 
      companyId, 
      companyName, 
      companyPhone, 
      deliveryFee,
      trackingUrl 
    } = body;

    // التحقق من الـ Vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "الشريك غير موجود" }, { status: 404 });
    }

    // التحقق من أن الطلب ينتمي للشريك
    const order = await prisma.order.findFirst({
      where: {
        id,
        vendorId: vendor.id,
        deletedAt: null,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // تحديث معلومات التوصيل
    if (deliveryType === 'AGENT') {
      // التحقق من وجود المندوب
      const agent = await prisma.vendorDeliveryAgent.findFirst({
        where: { id: agentId, vendorId: vendor.id },
      });

      if (!agent) {
        return NextResponse.json({ error: "المندوب غير موجود" }, { status: 404 });
      }

      // تحديث الطلب مع معلومات المندوب
      await prisma.order.update({
        where: { id },
        data: {
          status: "PREPARING",
          deliveryNotes: `مندوب توصيل: ${agentName} - ${agentPhone}`,
          // يمكن إضافة حقول مخصصة في المستقبل
        },
      });

      // تحديث عدد توصيلات المندوب
      await prisma.vendorDeliveryAgent.update({
        where: { id: agentId },
        data: { totalDeliveries: { increment: 1 } },
      });

    } else if (deliveryType === 'COMPANY') {
      // التحقق من وجود شركة الشحن
      const company = await prisma.vendorShippingCompany.findFirst({
        where: { id: companyId, vendorId: vendor.id },
      });

      if (!company) {
        return NextResponse.json({ error: "شركة الشحن غير موجودة" }, { status: 404 });
      }

      // تحديث الطلب مع معلومات شركة الشحن
      await prisma.order.update({
        where: { id },
        data: {
          status: "PREPARING",
          deliveryNotes: `شركة شحن: ${companyName} - ${companyPhone}${trackingUrl ? ` | رابط التتبع: ${trackingUrl}` : ''}`,
        },
      });

      // تحديث عدد شحنات الشركة
      await prisma.vendorShippingCompany.update({
        where: { id: companyId },
        data: { totalShipments: { increment: 1 } },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: deliveryType === 'AGENT' 
        ? `تم تعيين المندوب ${agentName} بنجاح` 
        : `تم تعيين شركة ${companyName} بنجاح`
    });
  } catch (error) {
    console.error("Error assigning delivery:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تعيين التوصيل" },
      { status: 500 }
    );
  }
}
