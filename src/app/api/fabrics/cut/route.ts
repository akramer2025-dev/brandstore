import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FabricService } from "@/lib/fabric-service";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const fabricPiece = await FabricService.cutFabric({
      fabricId: body.fabricId,
      productId: body.productId,
      lengthUsed: parseFloat(body.lengthUsed),
      quantity: parseInt(body.quantity),
      notes: body.notes,
    });

    return NextResponse.json(fabricPiece);
  } catch (error: any) {
    console.error("Error cutting fabric:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cut fabric" },
      { status: 500 }
    );
  }
}
