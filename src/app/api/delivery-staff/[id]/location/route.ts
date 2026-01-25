import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    const deliveryStaff = await prisma.deliveryStaff.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        lastLocationUpdate: true,
      },
    });

    if (!deliveryStaff) {
      return NextResponse.json(
        { error: "Delivery staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deliveryStaff);
  } catch (error: any) {
    console.error("Error fetching delivery staff location:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch location" },
      { status: 500 }
    );
  }
}

// Update location (for delivery staff app/device)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const resolvedParams = await params;

    const deliveryStaff = await prisma.deliveryStaff.update({
      where: { id: resolvedParams.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date(),
      },
    });

    return NextResponse.json(deliveryStaff);
  } catch (error: any) {
    console.error("Error updating delivery staff location:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update location" },
      { status: 500 }
    );
  }
}
