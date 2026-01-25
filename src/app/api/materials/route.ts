import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const materials = await prisma.rawMaterial.findMany({
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: { nameAr: "asc" },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, nameAr, category, unit, quantity, minQuantity, unitPrice, supplier, location } = body;

    if (!name || !nameAr || !category || !unit || quantity === undefined || minQuantity === undefined || unitPrice === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalValue = quantity * unitPrice;

    const material = await prisma.rawMaterial.create({
      data: {
        name,
        nameAr,
        category,
        unit,
        quantity,
        minQuantity,
        unitPrice,
        totalValue,
        supplier,
        location,
        lastPurchase: new Date(),
      },
    });

    // Create initial movement
    await prisma.materialMovement.create({
      data: {
        materialId: material.id,
        type: "PURCHASE",
        quantity,
        unitPrice,
        totalCost: totalValue,
        previousQty: 0,
        newQty: quantity,
        notes: "Initial purchase",
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
  }
}
