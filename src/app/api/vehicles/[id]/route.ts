import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
            businessNameAr: true,
            storeNameAr: true,
            logo: true,
            phone: true,
            whatsapp: true,
            rating: true,
            address: true,
            governorate: true,
            city: true,
          },
        },
        _count: {
          select: {
            inquiries: true,
            testDrives: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "المركبة غير موجودة" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات المركبة" },
      { status: 500 }
    );
  }
}
