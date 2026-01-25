import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, ShoppingBag, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
    },
    include: {
      orders: true,
    },
    orderBy: {
      createdAt: "desc",
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
          <Link href="/admin" className="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للوحة الإدارة
          </Link>
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <Users className="w-10 h-10" />
            العملاء
          </h1>
          <p className="text-teal-100 mt-2 text-lg">إجمالي العملاء: {customers.length}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => {
            const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
            
            return (
              <Card key={customer.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{customer.name}</CardTitle>
                    <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {customer.name?.charAt(0)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        انضم: {new Date(customer.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-3 rounded-lg text-center">
                      <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {customer.orders.length}
                      </p>
                      <p className="text-xs text-gray-500">طلب</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg text-center">
                      <p className="text-lg font-bold text-green-600">
                        {totalSpent}
                      </p>
                      <p className="text-xs text-gray-500">جنيه</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    عرض الطلبات
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {customers.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا يوجد عملاء</h3>
              <p className="text-gray-600">لم يتم تسجيل أي عملاء حتى الآن</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

