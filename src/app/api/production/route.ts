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
    const { productId, quantity, materials, laborCost, overheadCost, notes } = body;

    if (!productId || !quantity || !materials || materials.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate material costs
    let totalMaterialCost = 0;
    const materialDetails = [];

    for (const mat of materials) {
      const material = await prisma.rawMaterial.findUnique({
        where: { id: mat.materialId },
      });

      if (!material) {
        return NextResponse.json({ error: `Material ${mat.materialId} not found` }, { status: 404 });
      }

      if (material.quantity < mat.quantityUsed) {
        return NextResponse.json({ 
          error: `Insufficient quantity for ${material.nameAr}` 
        }, { status: 400 });
      }

      const costForMaterial = mat.quantityUsed * material.unitPrice;
      totalMaterialCost += costForMaterial;

      materialDetails.push({
        materialId: mat.materialId,
        quantityUsed: mat.quantityUsed,
        unitCost: material.unitPrice,
        totalCost: costForMaterial,
      });
    }

    const totalCost = totalMaterialCost + (laborCost || 0) + (overheadCost || 0);
    const costPerUnit = totalCost / quantity;

    // Create production order
    const production = await prisma.production.create({
      data: {
        productId,
        quantity,
        totalMaterialCost,
        laborCost: laborCost || 0,
        overheadCost: overheadCost || 0,
        totalCost,
        costPerUnit,
        status: "PLANNED",
        notes,
        createdBy: session.user.id,
        materials: {
          create: materialDetails,
        },
      },
      include: {
        product: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    // Deduct materials from inventory
    for (const mat of materials) {
      const material = await prisma.rawMaterial.findUnique({
        where: { id: mat.materialId },
      });

      if (material) {
        const newQty = material.quantity - mat.quantityUsed;
        await prisma.rawMaterial.update({
          where: { id: mat.materialId },
          data: {
            quantity: newQty,
            totalValue: newQty * material.unitPrice,
          },
        });

        // Record movement
        await prisma.materialMovement.create({
          data: {
            materialId: mat.materialId,
            type: "PRODUCTION",
            quantity: -mat.quantityUsed,
            unitPrice: material.unitPrice,
            totalCost: mat.quantityUsed * material.unitPrice,
            previousQty: material.quantity,
            newQty,
            reference: production.productionNumber,
            notes: `Production order #${production.productionNumber}`,
            createdBy: session.user.id,
          },
        });
      }
    }

    // Add to product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    return NextResponse.json(production);
  } catch (error) {
    console.error("Error creating production:", error);
    return NextResponse.json({ error: "Failed to create production" }, { status: 500 });
  }
}
