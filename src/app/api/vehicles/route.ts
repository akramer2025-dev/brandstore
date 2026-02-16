import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API - عرض المركبات للعملاء
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const type = searchParams.get('type'); // CAR or MOTORCYCLE
    const condition = searchParams.get('condition'); // NEW or USED
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const sortBy = searchParams.get('sortBy') || 'latest'; // latest, price_low, price_high, popular

    // Build where clause
    const where:any = {
      isActive: true,
      isAvailable: true,
    };

    if (type) where.type = type;
    if (condition) where.condition = condition;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_low') orderBy = { sellingPrice: 'asc' };
    else if (sortBy === 'price_high') orderBy = { sellingPrice: 'desc' };
    else if (sortBy === 'popular') orderBy = { viewCount: 'desc' };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          vendor: {
            select: {
              id: true,
              businessNameAr: true,
              storeNameAr: true,
              logo: true,
              phone: true,
              rating: true,
            },
          },
        },
      }),
      prisma.vehicle.count({ where }),
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
