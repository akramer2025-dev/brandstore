import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { WarehouseTabs } from "./WarehouseTabs";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/BackButton";

export default async function WarehousePage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // جلب جميع البيانات
  const [fabrics, materials, productions, products] = await Promise.all([
    prisma.fabric.findMany({
      include: {
        fabricPieces: true,
      },
      orderBy: { purchaseDate: "desc" },
    }),
    prisma.rawMaterial.findMany({
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { nameAr: "asc" },
    }),
    prisma.production.findMany({
      include: {
        product: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { stock: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/admin" label="العودة للوحة الإدارة" className="mb-2" />
          <h1 className="text-4xl font-bold drop-shadow-lg">
            🏭 إدارة المخزون والإنتاج الشاملة
          </h1>
          <p className="text-blue-100 mt-2 text-lg">
            الأقمشة • المواد الخام • الإنتاج • مخزون المنتجات
          </p>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <WarehouseTabs
          fabrics={fabrics}
          materials={materials}
          productions={productions}
          products={products}
        />
      </div>
    </div>
  );
}
