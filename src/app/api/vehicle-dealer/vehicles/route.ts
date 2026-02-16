import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "VEHICLE_DEALER") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب المعرض" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // حساب هامش ومبلغ الربح
    const purchasePrice = parseFloat(body.purchasePrice);
    const sellingPrice = parseFloat(body.sellingPrice);
    const profitAmount = sellingPrice - purchasePrice;
    const profitMargin = (profitAmount / purchasePrice) * 100;

    // إنشاء رقم مركبة فريد
    const vehicleCount = await prisma.vehicle.count();
    const vehicleNumber = `VEH-${Date.now()}-${vehicleCount + 1}`;

    // إنشاء المركبة
    const vehicle = await prisma.vehicle.create({
      data: {
        vendorId: vendor.id,
        vehicleNumber,
        
        // Basic Info
        type: body.type,
        condition: body.condition,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        color: body.color,
        fuelType: body.fuelType,
        transmission: body.transmission,
        
        // Used Vehicle Data (if applicable)
        mileage: body.mileage ? parseInt(body.mileage) : null,
        previousOwners: body.previousOwners ? parseInt(body.previousOwners) : null,
        accidentHistory: body.accidentHistory || false,
        accidentDetails: body.accidentDetails || null,
        maintenanceHistory: body.maintenanceHistory || null,
        licensePlate: body.licensePlate || null,
        
        // Technical Specs
        engineCapacity: body.engineCapacity || null,
        horsepower: body.horsepower ? parseInt(body.horsepower) : null,
        seats: body.seats ? parseInt(body.seats) : null,
        doors: body.doors ? parseInt(body.doors) : null,
        bodyType: body.bodyType || null,
        
        // Features
        features: body.features || null,
        hasWarranty: body.hasWarranty || false,
        warrantyDetails: body.warrantyDetails || null,
        hasFreeService: body.hasFreeService || false,
        freeServiceDetails: body.freeServiceDetails || null,
        
        // Pricing
        purchasePrice,
        sellingPrice,
        marketingPrice: body.marketingPrice ? parseFloat(body.marketingPrice) : null,
        negotiable: body.negotiable !== false,
        profitMargin,
        profitAmount,
        
        // Bank Financing
        allowBankFinancing: body.allowBankFinancing || false,
        minDownPayment: body.minDownPayment ? parseFloat(body.minDownPayment) : null,
        maxFinancingYears: body.maxFinancingYears ? parseInt(body.maxFinancingYears) : null,
        partnerBanks: body.partnerBanks || null,
        
        // Description
        description: body.description || null,
        descriptionAr: body.descriptionAr || null,
        sellerNotes: body.sellerNotes || null,
        internalNotes: body.internalNotes || null,
        
        // Location
        location: body.location || null,
        showroom: body.showroom || null,
        
        // Status
        isFeatured: body.isFeatured || false,
        isActive: body.isActive !== false,
        isAvailable: true,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة المركبة" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "VEHICLE_DEALER") {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب المعرض" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({
        where: { vendorId: vendor.id },
      }),
    ]);

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المركبات" },
      { status: 500 }
    );
  }
}
