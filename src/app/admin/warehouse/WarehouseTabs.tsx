"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Package2, Factory, AlertTriangle, TrendingUp, TrendingDown, Scissors, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddFabricButton, CutFabricButton } from "../fabrics/FabricActions";
import { AddMaterialButton, MaterialMovementButton } from "../materials/MaterialActions";
import { CreateProductionButton } from "../production/ProductionActions";

export function WarehouseTabs({ fabrics, materials, productions, products }: any) {
  const lowStockMaterials = materials.filter((m: any) => m.quantity <= m.minQuantity);
  const totalMaterialsValue = materials.reduce((sum: number, m: any) => sum + m.totalValue, 0);

  const lowStockProducts = products.filter((p: any) => p.stock <= 10);

  const productionStats = {
    total: productions.length,
    completed: productions.filter((p: any) => p.status === "COMPLETED").length,
    inProgress: productions.filter((p: any) => p.status === "IN_PROGRESS").length,
    planned: productions.filter((p: any) => p.status === "PLANNED").length,
  };

  return (
    <Tabs defaultValue="fabrics" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm shadow-xl h-14">
        <TabsTrigger value="fabrics" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
          <Package className="w-5 h-5 ml-2" />
          الأقمشة
        </TabsTrigger>
        <TabsTrigger value="materials" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
          <Package2 className="w-5 h-5 ml-2" />
          المواد الخام
        </TabsTrigger>
        <TabsTrigger value="production" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
          <Factory className="w-5 h-5 ml-2" />
          الإنتاج
        </TabsTrigger>
        <TabsTrigger value="inventory" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
          <Package className="w-5 h-5 ml-2" />
          مخزون المنتجات
        </TabsTrigger>
      </TabsList>

      {/* Fabrics Tab */}
      <TabsContent value="fabrics">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">إدارة الأقمشة</h2>
            <p className="text-gray-600">إجمالي الأقمشة: {fabrics.length}</p>
          </div>
          <AddFabricButton />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fabrics.map((fabric: any) => {
            const usedLength = fabric.fabricPieces.reduce((sum: number, piece: any) => sum + piece.lengthUsed, 0);
            const remainingLength = fabric.totalLength - usedLength;
            const usagePercentage = (usedLength / fabric.totalLength) * 100;

            return (
              <Card key={fabric.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{fabric.nameAr}</CardTitle>
                    <Package className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-500">{fabric.color} • {fabric.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">المتبقي: {remainingLength.toFixed(2)} متر</span>
                        <span className="text-gray-600">المستخدم: {usedLength.toFixed(2)} متر</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-600 to-cyan-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">{usagePercentage.toFixed(0)}% مستخدم</p>
                    </div>

                    <div className="bg-teal-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">سعر الشراء:</span>
                        <span className="font-bold text-teal-600">{fabric.purchasePrice} جنيه/متر</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الإجمالي:</span>
                        <span className="font-bold text-teal-600">{(fabric.purchasePrice * fabric.totalLength).toFixed(2)} جنيه</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">القطع المفصلة: {fabric.fabricPieces.length}</p>
                      <p className="text-xs text-gray-500">
                        تاريخ الشراء: {new Date(fabric.purchaseDate).toLocaleDateString("ar-EG")}
                      </p>
                    </div>

                    <CutFabricButton fabricId={fabric.id} remainingLength={remainingLength} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {fabrics.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد أقمشة</h3>
              <p className="text-gray-600 mb-4">ابدأ بشراء أقمشة جديدة</p>
              <AddFabricButton />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Materials Tab */}
      <TabsContent value="materials">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">المواد الخام والخامات</h2>
            <p className="text-gray-600">إجمالي المواد: {materials.length} | القيمة: {totalMaterialsValue.toFixed(2)} جنيه</p>
          </div>
          <AddMaterialButton />
        </div>

        {/* Stats */}
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
                  <p className="text-3xl font-bold text-green-600">{totalMaterialsValue.toFixed(0)} ج</p>
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
                {lowStockMaterials.map((material: any) => (
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
          {materials.map((material: any) => {
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

                    {material.movements.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-bold text-gray-700 mb-2">آخر الحركات:</p>
                        <div className="space-y-1">
                          {material.movements.slice(0, 3).map((movement: any) => (
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
              <p className="text-gray-600 mb-4">ابدأ بإضافة المواد الخام والخامات</p>
              <AddMaterialButton />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Production Tab */}
      <TabsContent value="production">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">إدارة الإنتاج</h2>
            <p className="text-gray-600">
              الأوامر: {productionStats.total} | مكتمل: {productionStats.completed} | قيد التنفيذ: {productionStats.inProgress}
            </p>
          </div>
          <CreateProductionButton />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي الأوامر</p>
                  <p className="text-3xl font-bold text-green-600">{productionStats.total}</p>
                </div>
                <Factory className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">مخطط</p>
                  <p className="text-3xl font-bold text-blue-600">{productionStats.planned}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">قيد التنفيذ</p>
                  <p className="text-3xl font-bold text-orange-600">{productionStats.inProgress}</p>
                </div>
                <Package className="w-12 h-12 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">مكتمل</p>
                  <p className="text-3xl font-bold text-green-600">{productionStats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productions List */}
        <div className="space-y-4">
          {productions.map((production: any) => {
            const statusColors = {
              PLANNED: "bg-blue-100 text-blue-700 border-blue-200",
              IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
              COMPLETED: "bg-green-100 text-green-700 border-green-200",
              CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
            };

            return (
              <Card
                key={production.id}
                className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{production.product.nameAr}</CardTitle>
                      <p className="text-sm text-gray-500">#{production.productionNumber}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                        statusColors[production.status as keyof typeof statusColors]
                      }`}
                    >
                      {production.status === "PLANNED" && "مخطط"}
                      {production.status === "IN_PROGRESS" && "قيد التنفيذ"}
                      {production.status === "COMPLETED" && "مكتمل"}
                      {production.status === "CANCELLED" && "ملغي"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">الكمية:</span>
                        <span className="font-bold">{production.quantity} قطعة</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">التكلفة الإجمالية:</span>
                        <span className="font-bold text-green-600">{production.totalCost.toFixed(2)} جنيه</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">تكلفة الوحدة:</span>
                        <span className="font-bold">{production.costPerUnit.toFixed(2)} جنيه</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">التكاليف</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>مواد:</span>
                            <span>{production.totalMaterialCost.toFixed(2)} ج</span>
                          </div>
                          <div className="flex justify-between">
                            <span>عمالة:</span>
                            <span>{production.laborCost.toFixed(2)} ج</span>
                          </div>
                          <div className="flex justify-between">
                            <span>تكاليف عامة:</span>
                            <span>{production.overheadCost.toFixed(2)} ج</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {production.materials.length > 0 && (
                    <div className="mt-4 bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-bold text-gray-700 mb-2">المواد المستخدمة:</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {production.materials.map((pm: any) => (
                          <div key={pm.id} className="text-sm flex justify-between">
                            <span>{pm.material.nameAr}:</span>
                            <span className="font-bold">
                              {pm.quantityUsed} {pm.material.unit} ({pm.totalCost.toFixed(2)} ج)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {production.notes && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">{production.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      تاريخ الإنشاء: {new Date(production.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                    {production.completionDate && (
                      <span>
                        تاريخ الإكمال: {new Date(production.completionDate).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {productions.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Factory className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد أوامر إنتاج</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء أمر إنتاج جديد</p>
              <CreateProductionButton />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Inventory Tab */}
      <TabsContent value="inventory">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">مخزون المنتجات الجاهزة</h2>
            <p className="text-gray-600">
              إجمالي المنتجات: {products.length} | منتجات منخفضة: {lowStockProducts.length}
            </p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="backdrop-blur-sm bg-red-50/80 border-red-200 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-600">
                <AlertCircle className="w-6 h-6" />
                تحذير: منتجات على وشك النفاد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-bold">{product.nameAr}</p>
                        <p className="text-sm text-gray-500">{product.category.nameAr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className={`text-2xl font-bold ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= 5 ? 'text-orange-600' : 
                          'text-yellow-600'
                        }`}>
                          {product.stock}
                        </p>
                        <p className="text-xs text-gray-500">قطعة متبقية</p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        إضافة للمخزون
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>جميع المنتجات في المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right py-3 px-4">المنتج</th>
                    <th className="text-right py-3 px-4">الفئة</th>
                    <th className="text-right py-3 px-4">الكمية</th>
                    <th className="text-right py-3 px-4">السعر</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold">{product.nameAr}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{product.category.nameAr}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-lg font-bold ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= 5 ? 'text-orange-600' : 
                          product.stock <= 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-purple-600">{product.price} جنيه</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.stock === 0 ? 'bg-red-100 text-red-800' : 
                          product.stock <= 5 ? 'bg-orange-100 text-orange-800' : 
                          product.stock <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.stock === 0 ? 'نفذ' : 
                           product.stock <= 5 ? 'حرج جداً' : 
                           product.stock <= 10 ? 'منخفض' :
                           'متوفر'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
