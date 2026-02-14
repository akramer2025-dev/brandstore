import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Plus, Edit, Trash2, AlertTriangle, Wallet, DollarSign, PiggyBank } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import ProductActions from "./ProductActions";
import ResetCapitalButton from "./ResetCapitalButton";

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const session = await auth();

  if (!session || session.user?.role !== "VENDOR") {
    redirect("/auth/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id }
  });

  if (!vendor) {
    redirect("/");
  }

  // بناء شروط البحث
  const whereCondition: any = { 
    vendorId: vendor.id,
    isActive: true  // استثناء المنتجات المحذوفة
  };

  // إضافة فلتر نوع المنتج إذا كان موجود
  if (searchParams.type === 'owned') {
    whereCondition.productSource = 'OWNED';
  } else if (searchParams.type === 'consignment') {
    whereCondition.productSource = 'CONSIGNMENT';
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  // جلب المعاملات لحساب إجمالي المشتريات
  const purchaseTransactions = await prisma.capitalTransaction.findMany({
    where: { 
      vendorId: vendor.id,
      type: 'PURCHASE'
    }
  }).catch(() => []);

  // جلب إجمالي الإيداعات
  const depositTransactions = await prisma.capitalTransaction.findMany({
    where: { 
      vendorId: vendor.id,
      type: 'DEPOSIT'
    }
  }).catch(() => []);

  // إجمالي رأس المال المودع (مع التحقق من وجود البيانات)
  const totalDeposits = Array.isArray(depositTransactions) 
    ? depositTransactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0) 
    : 0;
  
  // إجمالي المشتريات (المخصومة من رأس المال)
  const totalPurchases = Array.isArray(purchaseTransactions)
    ? purchaseTransactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0)
    : 0;
  
  // الرصيد الحالي (من الـ vendor مباشرة)
  const currentBalance = Number(vendor.capitalBalance) || 0;
  
  // قيمة المخزون الحالي (سعر الشراء × الكمية المتبقية)
  const currentStockValue = Array.isArray(products)
    ? products.reduce((sum, product) => {
        const purchasePrice = Number(product.productionCost) || 0;
        const stock = Number(product.stock) || 0;
        return sum + (purchasePrice * stock);
      }, 0)
    : 0;

  // حساب عدد كل نوع من المنتجات
  const ownedCount = Array.isArray(products)
    ? products.filter(p => p.productSource === 'OWNED').length
    : 0;
  const consignmentCount = Array.isArray(products)
    ? products.filter(p => p.productSource === 'CONSIGNMENT').length
    : 0;

  // تحديد العنوان بناءً على نوع الفلتر
  const pageTitle = searchParams.type === 'owned' 
    ? 'المنتجات المملوكة' 
    : searchParams.type === 'consignment' 
    ? 'منتجات الوسيط' 
    : 'إدارة المنتجات';

  const pageDescription = searchParams.type === 'owned'
    ? 'المنتجات التي تم شراؤها من رأس المال'
    : searchParams.type === 'consignment'
    ? 'المنتجات المعروضة بنظام الوسيط (العمولة)'
    : 'عرض وإدارة جميع منتجاتك';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/vendor/dashboard">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Package className="h-5 w-5 sm:h-8 sm:w-8 text-purple-400" />
                {pageTitle}
              </h1>
              <p className="text-gray-400 mt-0.5 text-xs sm:text-sm hidden sm:block">{pageDescription}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <ResetCapitalButton currentBalance={currentBalance} />
            <Link href="/vendor/purchases/new" className="w-full sm:w-auto">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-8 sm:h-10 text-xs sm:text-sm w-full">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                فاتورة مشتريات
              </Button>
            </Link>
            <Link href="/vendor/products/new" className="w-full sm:w-auto">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-8 sm:h-10 text-xs sm:text-sm w-full">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                إضافة منتج جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* فلتر نوع المنتجات */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href="/vendor/products">
            <Button 
              variant={!searchParams.type ? "default" : "outline"}
              className={!searchParams.type 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              <Package className="w-4 h-4 mr-2" />
              جميع المنتجات ({ownedCount + consignmentCount})
            </Button>
          </Link>
          <Link href="/vendor/products?type=owned">
            <Button 
              variant={searchParams.type === 'owned' ? "default" : "outline"}
              className={searchParams.type === 'owned'
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              <Wallet className="w-4 h-4 mr-2" />
              منتجات مملوكة ({ownedCount})
            </Button>
          </Link>
          <Link href="/vendor/products?type=consignment">
            <Button 
              variant={searchParams.type === 'consignment' ? "default" : "outline"}
              className={searchParams.type === 'consignment'
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              <PiggyBank className="w-4 h-4 mr-2" />
              منتجات وسيط ({consignmentCount})
            </Button>
          </Link>
        </div>

        {/* رأس المال والتكاليف */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                  <Wallet className="w-7 h-7 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">💰 إجمالي الإيداعات</p>
                  <p className="text-3xl font-bold text-yellow-400">{totalDeposits.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">رأس المال المودع</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                  <DollarSign className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">📦 إجمالي المشتريات</p>
                  <p className="text-3xl font-bold text-red-400">{totalPurchases.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">تم خصمها من رأس المال</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                  <PiggyBank className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">💵 الرصيد المتاح</p>
                  <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentBalance.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">متاح للشراء</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                  <Package className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">📊 قيمة المخزون</p>
                  <p className="text-3xl font-bold text-purple-400">{currentStockValue.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">سعر الشراء × الكمية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-gray-300 text-sm mb-2">إجمالي المنتجات</p>
              <p className="text-3xl font-bold text-white">{products?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-gray-300 text-sm mb-2">متوفر</p>
              <p className="text-3xl font-bold text-green-400">{products?.filter(p => (p.stock || 0) > 10).length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-gray-300 text-sm mb-2">مخزون منخفض</p>
              <p className="text-3xl font-bold text-orange-400">{products?.filter(p => (p.stock || 0) <= 10 && (p.stock || 0) > 0).length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-gray-300 text-sm mb-2">نفذ من المخزن</p>
              <p className="text-3xl font-bold text-red-400">{products?.filter(p => (p.stock || 0) === 0).length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg mb-4">لا توجد منتجات حتى الآن</p>
              <Link href="/vendor/products/new">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  أضف منتجك الأول
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all overflow-hidden">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-800">
                  {product.images ? (
                    <Image
                      src={product.images.split(',')[0]}
                      alt={product.nameAr || product.name || 'منتج'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3">
                    {(product.stock || 0) === 0 ? (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        نفذ
                      </div>
                    ) : (product.stock || 0) <= 10 ? (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        مخزون منخفض
                      </div>
                    ) : (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        متوفر
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="text-white font-bold text-lg mb-1">{product.nameAr || product.name || 'منتج'}</h3>
                    <p className="text-gray-400 text-sm">{product.category?.nameAr || product.category?.name || 'بدون فئة'}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-purple-400 font-bold text-xl">{Number(product.price).toLocaleString() || 0} ج.م</p>
                      {product.originalPrice && (
                        <p className="text-gray-500 line-through text-sm">{Number(product.originalPrice).toLocaleString()} ج.م</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-400 text-sm">الكمية</p>
                      <p className="text-white font-bold text-lg">{product.stock || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ProductActions 
                      productId={product.id} 
                      productName={product.nameAr || product.name || 'منتج'}
                      productImage={product.images ? product.images.split(',')[0] : undefined}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
