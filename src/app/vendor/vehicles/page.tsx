"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Car,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  condition: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  sellingPrice: number;
  purchasePrice: number;
  profitMargin: number;
  profitAmount: number;
  mileage: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  images: string | null;
  featuredImage: string | null;
  viewCount: number;
  inquiryCount: number;
  testDriveCount: number;
  createdAt: string;
  _count: {
    financingApplications: number;
    inquiries: number;
    testDrives: number;
  };
}

interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  totalPages: number;
}

export default function VehiclesDashboardPage() {
  const { data: session, status } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalProfit: 0,
    totalInquiries: 0,
    totalTestDrives: 0,
    totalFinancingApplications: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session && session.user?.role !== "VENDOR" && session.user?.role !== "ADMIN") {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
    fetchVehicles();
  }, [page, typeFilter, conditionFilter, availabilityFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      if (conditionFilter) params.append("condition", conditionFilter);
      if (availabilityFilter) params.append("isAvailable", availabilityFilter);

      const response = await fetch(`/api/vendor/vehicles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch vehicles");

      const data: VehiclesResponse = await response.json();
      setVehicles(data.vehicles);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      // حساب الإحصائيات
      const available = data.vehicles.filter((v) => v.isAvailable).length;
      const sold = data.vehicles.filter((v) => !v.isAvailable).length;
      const totalProfit = data.vehicles.reduce((sum, v) => sum + v.profitAmount, 0);
      const totalInquiries = data.vehicles.reduce((sum, v) => sum + v._count.inquiries, 0);
      const totalTestDrives = data.vehicles.reduce((sum, v) => sum + v._count.testDrives, 0);
      const totalFinancing = data.vehicles.reduce((sum, v) => sum + v._count.financingApplications, 0);

      setStats({
        totalVehicles: data.total,
        availableVehicles: available,
        soldVehicles: sold,
        totalProfit,
        totalInquiries,
        totalTestDrives,
        totalFinancingApplications: totalFinancing,
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المركبة؟")) return;

    try {
      const response = await fetch(`/api/vendor/vehicles/${vehicleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchVehicles();
      } else {
        alert("حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CAR: "سيارة",
      MOTORCYCLE: "موتوسيكل",
      TRUCK: "شاحنة",
      BUS: "حافلة",
      VAN: "فان",
    };
    return types[type] || type;
  };

  const getConditionLabel = (condition: string) => {
    const conditions: Record<string, string> = {
      NEW: "جديد",
      USED: "مستعمل",
      CERTIFIED: "معتمد",
    };
    return conditions[condition] || condition;
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-green-100 text-green-800",
      USED: "bg-blue-100 text-blue-800",
      CERTIFIED: "bg-purple-100 text-purple-800",
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">🚗 لوحة تحكم المعرض</h1>
                <p className="text-white/90 mt-1">إدارة السيارات والموتوسيكلات</p>
              </div>
            </div>
            <Link href="/vendor/vehicles/add">
              <Button className="bg-white text-purple-600 hover:bg-gray-100">
                <Plus className="w-5 h-5 ml-2" />
                إضافة مركبة جديدة
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Package className="w-4 h-4" />
                إجمالي المركبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalVehicles}</div>
              <p className="text-xs text-blue-700 mt-1">
                متاح: {stats.availableVehicles} | بيع: {stats.soldVehicles}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                إجمالي الأرباح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalProfit.toLocaleString()} ج.م
              </div>
              <p className="text-xs text-green-700 mt-1">من المركبات المتاحة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                الاستفسارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.totalInquiries}</div>
              <p className="text-xs text-orange-700 mt-1">طلبات التواصل</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                تجربة القيادة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalTestDrives}</div>
              <p className="text-xs text-purple-700 mt-1">طلبات تجربة</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input
                  type="text"
                  placeholder="ابحث برقم المركبة، الماركة، الموديل..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع المركبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="CAR">سيارة</SelectItem>
                  <SelectItem value="MOTORCYCLE">موتوسيكل</SelectItem>
                  <SelectItem value="TRUCK">شاحنة</SelectItem>
                  <SelectItem value="VAN">فان</SelectItem>
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="NEW">جديد</SelectItem>
                  <SelectItem value="USED">مستعمل</SelectItem>
                  <SelectItem value="CERTIFIED">معتمد</SelectItem>
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="التوفر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="true">متاح</SelectItem>
                  <SelectItem value="false">مباع</SelectItem>
                </SelectContent>
              </Select>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Grid */}
      <div className="max-w-7xl mx-auto">
        {vehicles.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد مركبات</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة مركبة جديدة للمعرض</p>
            <Link href="/vendor/vehicles/add">
              <Button>
                <Plus className="w-5 h-5 ml-2" />
                إضافة مركبة
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => {
                const firstImage = vehicle.featuredImage || vehicle.images?.split(",")[0] || "/placeholder.png";
                
                return (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src={firstImage}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Badge className={getConditionColor(vehicle.condition)}>
                          {getConditionLabel(vehicle.condition)}
                        </Badge>
                        {vehicle.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            ⭐ مميز
                          </Badge>
                        )}
                        {!vehicle.isAvailable && (
                          <Badge className="bg-red-100 text-red-800">
                            مباع
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-gray-800">
                          {getVehicleTypeLabel(vehicle.type)}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{vehicle.brand} {vehicle.model}</CardTitle>
                          <CardDescription className="mt-1">
                            {vehicle.year} • {vehicle.color}
                            {vehicle.mileage && ` • ${vehicle.mileage.toLocaleString()} كم`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Prices */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">سعر البيع</p>
                          <p className="text-xl font-bold text-purple-600">
                            {vehicle.sellingPrice.toLocaleString()} ج.م
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500">الربح</p>
                          <p className="text-lg font-bold text-green-600">
                            {vehicle.profitAmount.toLocaleString()} ج.م
                          </p>
                          <p className="text-xs text-green-600">
                            ({vehicle.profitMargin.toFixed(1)}%)
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">مشاهدات</p>
                          <p className="text-sm font-semibold flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3" />
                            {vehicle.viewCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">استفسارات</p>
                          <p className="text-sm font-semibold flex items-center justify-center gap-1">
                            <FileText className="w-3 h-3" />
                            {vehicle._count.inquiries}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">تجارب</p>
                          <p className="text-sm font-semibold flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {vehicle._count.testDrives}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 pt-2 border-t">
                        رقم المركبة: {vehicle.vehicleNumber}
                      </div>
                    </CardContent>

                    <CardFooter className="gap-2 pt-4 border-t">
                      <Link href={`/vendor/vehicles/${vehicle.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 ml-2" />
                          عرض
                        </Button>
                      </Link>
                      <Link href={`/vendor/vehicles/${vehicle.id}/edit`} className="flex-1">
                        <Button variant="default" className="w-full">
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  السابق
                </Button>
                <span className="px-4 py-2 text-sm">
                  صفحة {page} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
