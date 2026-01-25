import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - إنشاء سند صرف جديد
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientName, category, paymentMethod, description, reference, amount, items } = body;

    // التحقق من البيانات
    if (!recipientName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة وإضافة الأصناف" },
        { status: 400 }
      );
    }

    // توليد رقم السند
    const voucherCount = await prisma.paymentVoucher.count();
    const voucherNumber = `SR-${String(voucherCount + 1).padStart(6, '0')}`;

    // إنشاء سند الصرف
    const voucher = await prisma.paymentVoucher.create({
      data: {
        voucherNumber,
        type: 'EXPENSE',
        amount: parseFloat(amount),
        paymentMethod,
        recipientName,
        category,
        description,
        reference,
        status: 'APPROVED', // معتمد تلقائياً
        paidBy: session.user.id,
        approvedBy: session.user.id,
        approvedAt: new Date()
      }
    });

    // معالجة الأصناف وتحديث المخزون
    for (const item of items) {
      if (!item.materialId) continue;

      // جلب المادة الحالية
      const material = await prisma.rawMaterial.findUnique({
        where: { id: item.materialId }
      });

      if (!material) continue;

      // حساب الكميات والقيم الجديدة
      const newQuantity = material.quantity + parseFloat(item.quantity);
      const newTotalValue = (material.totalValue || 0) + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
      const newUnitPrice = newTotalValue / newQuantity; // متوسط السعر المرجح

      // تحديث المادة
      await prisma.rawMaterial.update({
        where: { id: item.materialId },
        data: {
          quantity: newQuantity,
          unitPrice: newUnitPrice,
          totalValue: newTotalValue,
          lastPurchase: new Date(),
          supplier: recipientName
        }
      });

      // تسجيل حركة الشراء
      await prisma.materialMovement.create({
        data: {
          materialId: item.materialId,
          type: 'PURCHASE',
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalCost: parseFloat(item.totalCost),
          previousQty: material.quantity,
          newQty: newQuantity,
          reference: `سند صرف: ${voucherNumber}`,
          notes: description,
          createdBy: session.user.id
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      voucher,
      message: "تم إنشاء سند الصرف وتحديث المخزون بنجاح" 
    });
  } catch (error) {
    console.error("Error creating purchase voucher:", error);
    return NextResponse.json(
      { error: "فشل إنشاء سند الصرف" },
      { status: 500 }
    );
  }
}

// GET - جلب جميع سندات الصرف
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const vouchers = await prisma.paymentVoucher.findMany({
      where: {
        type: 'EXPENSE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ vouchers });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "فشل جلب السندات" },
      { status: 500 }
    );
  }
}
