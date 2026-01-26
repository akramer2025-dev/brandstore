import { redirect } from "next/navigation";

export default async function AdminMaterialsPage() {
  redirect("/admin/warehouse?tab=materials");
}

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-2 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                العودة للوحة الإدارة
              </Link>
              <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
                <Package2 className="w-10 h-10" />
                إدارة المخزون والخامات
              </h1>
              <p className="text-blue-100 mt-2 text-lg">إجمالي المواد: {materials.length} | القيمة الإجمالية: {totalValue.toFixed(2)} جنيه</p>
            </div>
            <AddMaterialButton />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي المواد</p>
                  <p className="text-3xl font-bold text-blue-600">{materials.length}</p>
                </div>
                <Package2 className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">تحذيرات المخزون</p>
                  <p className="text-3xl font-bold text-orange-600">{lowStockMaterials.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">القيمة الإجمالية</p>
                  <p className="text-3xl font-bold text-green-600">{totalValue.toFixed(0)} ج</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockMaterials.length > 0 && (
          <Card className="backdrop-blur-sm bg-orange-50/80 border-orange-200 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-6 h-6" />
                تحذير: مواد قاربت على النفاد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockMaterials.map((material) => (
                  <div key={material.id} className="bg-white/80 p-3 rounded-lg">
                    <p className="font-bold text-gray-800">{material.nameAr}</p>
                    <p className="text-sm text-gray-600">الكمية: {material.quantity} {material.unit}</p>
                    <p className="text-xs text-orange-600">الحد الأدنى: {material.minQuantity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Materials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const isLowStock = material.quantity <= material.minQuantity;
            const stockPercentage = (material.quantity / (material.minQuantity * 2)) * 100;

            return (
              <Card key={material.id} className={`backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${isLowStock ? 'border-orange-300 border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{material.nameAr}</CardTitle>
                    <Package2 className={`w-6 h-6 ${isLowStock ? 'text-orange-600' : 'text-blue-600'}`} />
                  </div>
                  <p className="text-sm text-gray-500">{material.name} • {material.category}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">الكمية المتاحة</span>
                        <span className={`font-bold ${isLowStock ? 'text-orange-600' : 'text-gray-800'}`}>
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isLowStock ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        الحد الأدنى: {material.minQuantity} {material.unit}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">سعر الوحدة:</span>
                        <span className="font-bold text-blue-600">{material.unitPrice} جنيه</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">القيمة الإجمالية:</span>
                        <span className="font-bold text-blue-600">{material.totalValue.toFixed(2)} جنيه</span>
                      </div>
                    </div>

                    {material.supplier && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">المورد: {material.supplier}</p>
                        {material.location && (
                          <p className="text-xs text-gray-500 mt-1">الموقع: {material.location}</p>
                        )}
                      </div>
                    )}

                    {material.movements.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-bold text-gray-700 mb-2">آخر الحركات:</p>
                        <div className="space-y-1">
                          {material.movements.slice(0, 3).map((movement) => (
                            <div key={movement.id} className="flex items-center justify-between text-xs">
                              <span className={`flex items-center gap-1 ${movement.type === 'PURCHASE' ? 'text-green-600' : 'text-orange-600'}`}>
                                {movement.type === 'PURCHASE' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {movement.type}
                              </span>
                              <span className="text-gray-600">{movement.quantity} {material.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <MaterialMovementButton materialId={material.id} materialName={material.nameAr} unit={material.unit} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {materials.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Package2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد مواد في المخزون</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة المواد الخام والخامات المختلفة</p>
              <AddMaterialButton />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
