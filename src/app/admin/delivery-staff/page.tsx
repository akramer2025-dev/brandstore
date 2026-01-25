import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDeliveryStaffPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const deliveryStaff = await prisma.deliveryStaff.findMany({
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float-slow"></div>
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
                <Truck className="w-10 h-10" />
                موظفي التوصيل
              </h1>
              <p className="text-teal-100 mt-2 text-lg">إجمالي الموظفين: {deliveryStaff.length}</p>
            </div>
            <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-xl">
              <Plus className="w-5 h-5 ml-2" />
              إضافة موظف توصيل
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryStaff.map((staff) => (
            <Card key={staff.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{staff.name}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${staff.isAvailable ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                </div>
                <p className={`text-sm font-bold ${staff.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {staff.isAvailable ? 'متاح للتوصيل' : 'مشغول'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{staff.phone}</span>
                  </div>
                  {staff.vehicleNumber && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm">مركبة رقم: {staff.vehicleNumber}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">الطلبات الحالية:</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {staff._count.orders}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    عرض التفاصيل
                  </Button>
                  <Button 
                    size="sm" 
                    className={`flex-1 ${staff.isAvailable ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {staff.isAvailable ? 'تعيين مشغول' : 'تعيين متاح'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {deliveryStaff.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا يوجد موظفي توصيل</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة موظفي توصيل لفريق العمل</p>
              <Button>
                <Plus className="w-5 h-5 ml-2" />
                إضافة موظف توصيل
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

