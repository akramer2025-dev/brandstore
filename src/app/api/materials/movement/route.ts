import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { materialId, type, quantity, unitPrice, reference, notes } = body;

    if (!materialId || !type || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get current material
    const material = await prisma.rawMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const previousQty = material.quantity;
    const newQty = previousQty + quantity;

    if (newQty < 0) {
      return NextResponse.json({ error: "Insufficient quantity" }, { status: 400 });
    }

    const effectiveUnitPrice = unitPrice || material.unitPrice;
    const totalCost = quantity * effectiveUnitPrice;
    const newTotalValue = newQty * material.unitPrice;

    // Update material quantity and value
    const updatedMaterial = await prisma.rawMaterial.update({
      where: { id: materialId },
      data: {
        quantity: newQty,
        totalValue: newTotalValue,
        ...(type === "PURCHASE" && unitPrice && { unitPrice, lastPurchase: new Date() }),
      },
    });

    // Create movement record
    const movement = await prisma.materialMovement.create({
      data: {
        materialId,
        type,
        quantity,
        unitPrice: effectiveUnitPrice,
        totalCost,
        previousQty,
        newQty,
        reference,
        notes,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ material: updatedMaterial, movement });
  } catch (error) {
    console.error("Error creating material movement:", error);
    return NextResponse.json({ error: "Failed to create movement" }, { status: 500 });
  }
}
