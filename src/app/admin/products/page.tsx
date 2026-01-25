import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ProductActions } from "@/components/ProductActions";

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const products = await prisma.product.findMany({
    include: {
      category: true,
      vendor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-2 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                العودة للوحة الإدارة
              </Link>
              <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
                <Package className="w-10 h-10" />
                إدارة المنتجات
              </h1>
              <p className="text-teal-100 mt-2 text-lg">إجمالي المنتجات: {products.length}</p>
            </div>
            <Link href="/admin/products/new">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-xl">
                <Plus className="w-5 h-5 ml-2" />
                إضافة منتج جديد
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="pb-3">
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                  {product.images ? (
                    <Image
                      src={product.images.split(',')[0]?.trim() || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
                    product.stock > 20 ? 'bg-green-500' : product.stock > 10 ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white shadow-lg`}>
                    المخزون: {product.stock}
                  </div>
                  {/* Images Count Badge */}
                  {product.images && product.images.split(',').length > 1 && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shadow-lg flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {product.images.split(',').length} صور
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <p className="text-sm text-gray-500">{product.category.name}</p>
                {product.vendor ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-xs font-semibold">
                      {product.vendor.user?.name || product.vendor.businessName}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-xs font-semibold inline-block">
                      غير مسند لشريك
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {product.price} جنيه
                    </p>
                  </div>
                </div>
                <ProductActions productId={product.id} productName={product.name} />
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة منتجات جديدة للمتجر</p>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة منتج جديد
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

