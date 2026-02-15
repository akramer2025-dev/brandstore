import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause - المنتجات النشطة والظاهرة فقط
    const where: any = { 
      isActive: true,
      isVisible: true, // عرض المنتجات الظاهرة فقط للعملاء
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === "price" || sortBy === "stock" || sortBy === "createdAt") {
      orderBy[sortBy] = sortOrder;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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

    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        price: parseFloat(body.price),
        categoryId: body.categoryId,
        images: body.images || null,
        stock: parseInt(body.stock) || 0,
        allowInstallment: body.allowInstallment || false, // دعم التقسيط
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
