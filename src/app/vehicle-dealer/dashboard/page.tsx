import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Car, 
  DollarSign, 
  Eye, 
  MessageSquare, 
  Plus, 
  TrendingUp,
  Calendar,
  Users,
  FileText,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "لوحة تحكم معرض السيارات",
  description: "إدارة متجرك الإلكتروني للسيارات والموتوسيكلات",
};

async function getVehicleDealerStats(vendorId: string) {
  const [
    totalVehicles,
    availableVehicles,
    soldVehicles,
    totalRevenue,
    pendingFinancing,
    activeInquiries,
    scheduledTestDrives,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { vendorId } }),
    prisma.vehicle.count({ where: { vendorId, isAvailable: true } }),
    prisma.vehicle.count({ where: { vendorId, soldAt: { not: null } } }),
    prisma.vehicle.aggregate({
      where: { vendorId, soldAt: { not: null } },
      _sum: { profitAmount: true },
    }),
    prisma.vehicleFinancing.count({
      where: {
        vehicle: { vendorId },
        status: { in: ['PENDING', 'DOCUMENTS_REVIEW', 'BANK_PROCESSING'] },
      },
    }),
    prisma.vehicleInquiry.count({
      where: { vehicle: { vendorId }, isContacted: false },
    }),
    prisma.testDriveRequest.count({
      where: { 
        vehicle: { vendorId },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
  ]);

  return {
    totalVehicles,
    availableVehicles,
    soldVehicles,
    totalRevenue: totalRevenue._sum.profitAmount || 0,
    pendingFinancing,
    activeInquiries,
    scheduledTestDrives,
  };
}

async function getRecentVehicles(vendorId: string) {
  return await prisma.vehicle.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      vehicleNumber: true,
      type: true,
      brand: true,
      model: true,
      year: true,
      condition: true,
      sellingPrice: true,
      isAvailable: true,
      viewCount: true,
      featuredImage: true,
      createdAt: true,
    },
  });
}

export default async function VehicleDealerDashboard() {
  const session = await auth();

  if (!session || session.user?.role !== "VEHICLE_DEALER") {
    redirect("/");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    redirect("/");
  }

  const stats = await getVehicleDealerStats(vendor.id);
  const recentVehicles = await getRecentVehicles(vendor.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🚗 لوحة تحكم معرض السيارات
              </h1>
              <p className="text-gray-600 mt-2">
                مرحباً {vendor.businessNameAr || vendor.storeName} - أهلاً بك في لوحة التحكم الخاصة بك
              </p>
            </div>
            <Link href="/vehicle-dealer/vehicles/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-5 h-5 ml-2" />
                إضافة مركبة جديدة
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Vehicles */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
              <Car className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalVehicles}</div>
              <p className="text-sm opacity-80 mt-1">
                {stats.availableVehicles} متوفرة للبيع
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
              <DollarSign className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRevenue.toFixed(0)} ج.م</div>
              <p className="text-sm opacity-80 mt-1">
                من {stats.soldVehicles} مركبة مباعة
              </p>
            </CardContent>
          </Card>

          {/* Financing Applications */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">طلبات التمويل</CardTitle>
              <FileText className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingFinancing}</div>
              <p className="text-sm opacity-80 mt-1">
                قيد المعالجة
              </p>
            </CardContent>
          </Card>

          {/* Test Drives */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">تجارب القيادة</CardTitle>
              <Calendar className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.scheduledTestDrives}</div>
              <p className="text-sm opacity-80 mt-1">
                مجدولة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/vehicle-dealer/inquiries">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MessageSquare className="h-5 w-5 ml-2 text-blue-600" />
                  الاستفسارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.activeInquiries}</p>
                <p className="text-sm text-gray-500 mt-1">استفسارات جديدة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vehicle-dealer/financing">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 ml-2 text-green-600" />
                  التمويل البنكي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.pendingFinancing}</p>
                <p className="text-sm text-gray-500 mt-1">طلبات قيد المراجعة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vehicle-dealer/test-drives">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 ml-2 text-purple-600" />
                  تجارب القيادة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{stats.scheduledTestDrives}</p>
                <p className="text-sm text-gray-500 mt-1">مواعيد محجوزة</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المركبات الأخيرة</span>
              <Link href="/vehicle-dealer/vehicles">
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>آخر المركبات المضافة</CardDescription>
          </CardHeader>
          <CardContent>
            {recentVehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">لم تقم بإضافة أي مركبات بعد</p>
                <Link href="/vehicle-dealer/vehicles/new">
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مركبة الآن
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVehicles.map((vehicle) => (
                  <Link 
                    key={vehicle.id} 
                    href={`/vehicle-dealer/vehicles/${vehicle.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        {vehicle.featuredImage && (
                          <img 
                            src={vehicle.featuredImage} 
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {vehicle.brand} {vehicle.model} {vehicle.year}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicle.vehicleNumber} • {vehicle.type === 'CAR' ? 'سيارة' : 'موتوسيكل'} • {vehicle.condition === 'NEW' ? 'جديد' : 'مستعمل'}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {vehicle.viewCount} مشاهدة
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-blue-600">
                          {vehicle.sellingPrice.toLocaleString()} ج.م
                        </p>
                        {vehicle.isAvailable ? (
                          <span className="text-xs text-green-600 font-medium">متوفر</span>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">مباع</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
