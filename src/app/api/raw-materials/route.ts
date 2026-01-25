import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - جلب جميع المواد الخام
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const materials = await prisma.rawMaterial.findMany({
      orderBy: {
        nameAr: 'asc'
      }
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Error fetching raw materials:", error);
    return NextResponse.json(
      { error: "فشل جلب المواد" },
      { status: 500 }
    );
  }
}

// POST - إضافة مادة خام جديدة
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { name, nameAr, category, unit, quantity, unitPrice, supplier, location, minQuantity } = body;

    // التحقق من البيانات
    if (!nameAr || !category || !unit || quantity === undefined || unitPrice === undefined) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    // حساب القيمة الإجمالية
    const totalValue = quantity * unitPrice;

    // إنشاء المادة
    const material = await prisma.rawMaterial.create({
      data: {
        name: name || nameAr,
        nameAr,
        category,
        unit,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        totalValue,
        supplier,
        location,
        minQuantity: minQuantity ? parseFloat(minQuantity) : 10,
        lastPurchase: new Date()
      }
    });

    // تسجيل حركة شراء
    await prisma.materialMovement.create({
      data: {
        materialId: material.id,
        type: 'PURCHASE',
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        totalCost: totalValue,
        previousQty: 0,
        newQty: parseFloat(quantity),
        reference: 'إضافة مادة جديدة',
        createdBy: session.user.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      material,
      message: "تمت إضافة المادة بنجاح" 
    });
  } catch (error) {
    console.error("Error creating raw material:", error);
    return NextResponse.json(
      { error: "فشل إضافة المادة" },
      { status: 500 }
    );
  }
}
