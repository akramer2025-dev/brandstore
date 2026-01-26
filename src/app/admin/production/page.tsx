import { redirect } from "next/navigation";

export default async function AdminProductionPage() {
  redirect("/admin/warehouse?tab=production");
}

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-2 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                العودة للوحة الإدارة
              </Link>
              <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
                <Factory className="w-10 h-10" />
                إدارة الإنتاج
              </h1>
              <p className="text-green-100 mt-2 text-lg">
                إجمالي أوامر الإنتاج: {stats.total} | مكتمل: {stats.completed} | قيد التنفيذ: {stats.inProgress}
              </p>
            </div>
            <CreateProductionButton />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي الأوامر</p>
                  <p className="text-3xl font-bold text-green-600">{stats.total}</p>
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
                  <p className="text-3xl font-bold text-blue-600">{stats.planned}</p>
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
                  <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
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
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Productions List */}
        <div className="space-y-4">
          {productions.map((production) => {
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
                        statusColors[production.status]
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

                  {production.materials && production.materials.length > 0 && (
                    <div className="mt-4 bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-bold text-gray-700 mb-2">المواد المستخدمة:</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {production.materials.map((pm: any) => (
                          <div key={pm.id} className="text-sm flex justify-between">
                            <span>{pm.material?.nameAr || 'N/A'}:</span>
                            <span className="font-bold">
                              {pm.quantityUsed} {pm.material?.unit || ''} ({pm.totalCost?.toFixed(2) || '0'} ج)
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
      </div>
    </div>
  );
}
