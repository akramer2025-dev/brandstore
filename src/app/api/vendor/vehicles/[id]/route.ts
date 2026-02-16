import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - جلب مركبة واحدة
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const vehicleId = resolvedParams.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            phone: true,
            address: true,
          },
        },
        financingApplications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        inquiries: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        testDrives: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "المركبة غير موجودة" }, { status: 404 });
    }

    // زيادة عداد المشاهدات
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المركبة" },
      { status: 500 }
    );
  }
}

// PATCH - تحديث مركبة
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !["VENDOR", "ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const resolvedParams = await params;
    const vehicleId = resolvedParams.id;
    const body = await req.json();

    // التحقق من الصلاحية
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { vendor: { include: { user: true } } },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "المركبة غير موجودة" }, { status: 404 });
    }

    // إذا كان vendor، يجب أن يكون المالك
    if (session.user?.role === "VENDOR" && existingVehicle.vendor.userId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // حساب هامش الربح إذا تم تحديث الأسعار
    const updateData: any = {};
    
    if (body.purchasePrice !== undefined || body.sellingPrice !== undefined) {
      const purchasePrice = body.purchasePrice !== undefined 
        ? parseFloat(body.purchasePrice) 
        : existingVehicle.purchasePrice;
      const sellingPrice = body.sellingPrice !== undefined 
        ? parseFloat(body.sellingPrice) 
        : existingVehicle.sellingPrice;
      
      updateData.profitAmount = sellingPrice - purchasePrice;
      updateData.profitMargin = (updateData.profitAmount / purchasePrice) * 100;
    }

    // إضافة بقية التحديثات
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && key !== "id" && key !== "vendorId" && key !== "vehicleNumber") {
        if (["year", "mileage", "previousOwners", "horsepower", "seats", "doors", "maxFinancingYears"].includes(key)) {
          updateData[key] = parseInt(body[key]);
        } else if (["purchasePrice", "sellingPrice", "marketingPrice", "minDownPayment"].includes(key)) {
          updateData[key] = body[key] ? parseFloat(body[key]) : null;
        } else {
          updateData[key] = body[key];
        }
      }
    });

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
          },
        },
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المركبة" },
      { status: 500 }
    );
  }
}

// DELETE - حذف مركبة
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !["VENDOR", "ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const resolvedParams = await params;
    const vehicleId = resolvedParams.id;

    // التحقق من الصلاحية
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { vendor: { include: { user: true } } },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "المركبة غير موجودة" }, { status: 404 });
    }

    // إذا كان vendor، يجب أن يكون المالك
    if (session.user?.role === "VENDOR" && existingVehicle.vendor.userId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ message: "تم حذف المركبة بنجاح" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف المركبة" },
      { status: 500 }
    );
  }
}
