import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FabricService } from "@/lib/fabric-service";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fabrics = await FabricService.getAvailableFabrics();

    return NextResponse.json(fabrics);
  } catch (error) {
    console.error("Error fetching fabrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch fabrics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const fabric = await FabricService.purchaseFabric({
      name: body.name,
      nameAr: body.nameAr,
      type: body.type,
      color: body.color,
      purchasePrice: parseFloat(body.purchasePrice),
      totalLength: parseFloat(body.totalLength),
      supplier: body.supplier,
    });

    return NextResponse.json(fabric);
  } catch (error) {
    console.error("Error creating fabric:", error);
    return NextResponse.json(
      { error: "Failed to create fabric" },
      { status: 500 }
    );
  }
}
