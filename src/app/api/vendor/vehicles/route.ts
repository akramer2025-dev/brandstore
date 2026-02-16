import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - جلب مركبات الشريك
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !["VENDOR", "ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const condition = searchParams.get("condition") || "";
    const isAvailable = searchParams.get("isAvailable");
    const skip = (page - 1) * limit;

    // إذا كان vendor، جلب مركباته فقط
    let vendorId = searchParams.get("vendorId");
    if (session.user?.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
      });
      if (!vendor) {
        return NextResponse.json({ error: "البائع غير موجود" }, { status: 404 });
      }
      vendorId = vendor.id;
    }

    const where: any = {};
    
    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { licensePlate: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (condition) {
      where.condition = condition;
    }

    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === "true";
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessNameAr: true,
            },
          },
          _count: {
            select: {
              financingApplications: true,
              inquiries: true,
              testDrives: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المركبات" },
      { status: 500 }
    );
  }
}

// POST - إضافة مركبة جديدة
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !["VENDOR", "ADMIN"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();

    // إذا كان vendor، استخدم vendorId الخاص به
    let vendorId = body.vendorId;
    if (session.user?.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
      });
      if (!vendor) {
        return NextResponse.json({ error: "البائع غير موجود" }, { status: 404 });
      }
      vendorId = vendor.id;
    }

    // توليد رقم مركبة فريد
    const vehicleNumber = `VEH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // حساب هامش الربح
    const profitAmount = body.sellingPrice - body.purchasePrice;
    const profitMargin = (profitAmount / body.purchasePrice) * 100;

    const vehicle = await prisma.vehicle.create({
      data: {
        vendorId,
        vehicleNumber,
        type: body.type,
        condition: body.condition,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        color: body.color,
        fuelType: body.fuelType,
        transmission: body.transmission,
        
        // بيانات المستعمل
        mileage: body.mileage ? parseInt(body.mileage) : null,
        previousOwners: body.previousOwners ? parseInt(body.previousOwners) : null,
        accidentHistory: body.accidentHistory || false,
        accidentDetails: body.accidentDetails || null,
        maintenanceHistory: body.maintenanceHistory || null,
        licensePlate: body.licensePlate || null,
        
        // المواصفات
        engineCapacity: body.engineCapacity || null,
        horsepower: body.horsepower ? parseInt(body.horsepower) : null,
        seats: body.seats ? parseInt(body.seats) : null,
        doors: body.doors ? parseInt(body.doors) : null,
        bodyType: body.bodyType || null,
        
        // المميزات
        features: body.features || null,
        hasWarranty: body.hasWarranty || false,
        warrantyDetails: body.warrantyDetails || null,
        hasFreeService: body.hasFreeService || false,
        freeServiceDetails: body.freeServiceDetails || null,
        
        // الأسعار
        purchasePrice: parseFloat(body.purchasePrice),
        sellingPrice: parseFloat(body.sellingPrice),
        marketingPrice: body.marketingPrice ? parseFloat(body.marketingPrice) : null,
        negotiable: body.negotiable !== false,
        profitMargin,
        profitAmount,
        
        // التمويل البنكي
        allowBankFinancing: body.allowBankFinancing || false,
        minDownPayment: body.minDownPayment ? parseFloat(body.minDownPayment) : null,
        maxFinancingYears: body.maxFinancingYears ? parseInt(body.maxFinancingYears) : null,
        partnerBanks: body.partnerBanks || null,
        
        // الوصف
        description: body.description || null,
        descriptionAr: body.descriptionAr || null,
        sellerNotes: body.sellerNotes || null,
        internalNotes: body.internalNotes || null,
        
        // الصور
        images: body.images || null,
        featuredImage: body.featuredImage || null,
        videoUrl: body.videoUrl || null,
        
        // الموقع
        location: body.location || null,
        showroom: body.showroom || null,
        isAvailable: body.isAvailable !== false,
        isFeatured: body.isFeatured || false,
        isActive: body.isActive !== false,
      },
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

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة المركبة" },
      { status: 500 }
    );
  }
}
