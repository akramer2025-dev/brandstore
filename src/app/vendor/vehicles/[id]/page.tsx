"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  CarFront,
  DollarSign,
  Calendar,
  MapPin,
  Gauge,
  Fuel,
  Users,
  Shield,
  Star,
  FileText,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

interface Vehicle {
  id: string;
  vendorId: string;
  vehicleNumber: string;
  type: string;
  condition: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: string;
  transmission: string;
  mileage: number | null;
  previousOwners: number | null;
  accidentHistory: boolean;
  accidentDetails: string | null;
  maintenanceHistory: string | null;
  licensePlate: string | null;
  engineCapacity: string | null;
  horsepower: number | null;
  seats: number | null;
  doors: number | null;
  bodyType: string | null;
  features: string | null;
  hasWarranty: boolean;
  warrantyDetails: string | null;
  hasFreeService: boolean;
  freeServiceDetails: string | null;
  purchasePrice: number;
  sellingPrice: number;
  marketingPrice: number | null;
  negotiable: boolean;
  profitMargin: number;
  profitAmount: number;
  allowBankFinancing: boolean;
  minDownPayment: number | null;
  maxFinancingYears: number | null;
  partnerBanks: string | null;
  description: string | null;
  descriptionAr: string | null;
  sellerNotes: string | null;
  internalNotes: string | null;
  images: string | null;
  featuredImage: string | null;
  videoUrl: string | null;
  location: string | null;
  showroom: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: string;
    businessName: string;
    businessNameAr: string | null;
    phone: string;
    address: string | null;
  };
  financingApplications: any[];
  inquiries: any[];
  testDrives: any[];
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [params.id]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vendor/vehicles/${params.id}`);
      if (!response.ok) throw new Error("فشل في تحميل بيانات المركبة");
      
      const data = await response.json();
      setVehicle(data.vehicle);
    } catch (error: any) {
      console.error("Error fetching vehicle:", error);
      toast.error(error.message || "حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/vendor/vehicles/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في حذف المركبة");
      }

      toast.success("✅ تم حذف المركبة بنجاح");
      router.push("/vendor/vehicles");
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CAR: "🚗 سيارة",
      MOTORCYCLE: "🏍️ موتوسيكل",
      TRUCK: "🚚 شاحنة",
      VAN: "🚐 فان",
      BUS: "🚌 حافلة",
    };
    return types[type] || type;
  };

  const getConditionLabel = (condition: string) => {
    const conditions: Record<string, string> = {
      NEW: "✨ جديد",
      USED: "🔧 مستعمل",
      CERTIFIED: "✅ معتمد",
    };
    return conditions[condition] || condition;
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const types: Record<string, string> = {
      PETROL: "⛽ بنزين",
      DIESEL: "🛢️ ديزل",
      ELECTRIC: "🔋 كهربائي",
      HYBRID: "⚡ هجين",
      LPG: "🌿 غاز طبيعي",
    };
    return types[fuelType] || fuelType;
  };

  const getTransmissionLabel = (transmission: string) => {
    const types: Record<string, string> = {
      MANUAL: "يدوي (مانيوال)",
      AUTOMATIC: "أوتوماتيك",
      CVT: "CVT",
      SEMI_AUTO: "نصف أوتوماتيك",
    };
    return types[transmission] || transmission;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات المركبة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-12 text-center">
          <CarFront className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            المركبة غير موجودة
          </h3>
          <p className="text-gray-500 mb-6">
            لم يتم العثور على المركبة المطلوبة أو تم حذفها
          </p>
          <Button asChild>
            <Link href="/vendor/vehicles">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للقائمة
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const images = vehicle.images ? vehicle.images.split(',').filter(Boolean) : [];
  const firstImage = vehicle.featuredImage || images[0] || "/placeholder-car.png";
  const featuresList = vehicle.features ? vehicle.features.split(',').map(f => f.trim()).filter(Boolean) : [];
  const banks = vehicle.partnerBanks ? vehicle.partnerBanks.split(',').map(b => b.trim()).filter(Boolean) : [];

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/vendor/vehicles")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة للقائمة
        </Button>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {vehicle.brand} {vehicle.model}
              </h1>
              {!vehicle.isAvailable && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  مباع
                </span>
              )}
              {vehicle.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  مميز
                </span>
              )}
            </div>
            <p className="text-gray-600">
              رقم المركبة: <span className="font-semibold text-purple-700">{vehicle.vehicleNumber}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Link href={`/vendor/vehicles/${vehicle.id}/edit`}>
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              {deleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Right Column: Images & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardContent className="p-6">
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={firstImage}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow font-semibold">
                  {getConditionLabel(vehicle.condition)}
                </div>
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 8).map((img, index) => (
                    <div key={index} className="relative h-20 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-75 transition">
                      <Image
                        src={img}
                        alt={`صورة ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">النوع</p>
                  <p className="font-bold">{getTypeLabel(vehicle.type)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">السنة</p>
                  <p className="font-bold">{vehicle.year}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">اللون</p>
                  <p className="font-bold">{vehicle.color}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">الوقود</p>
                  <p className="font-bold">{getFuelTypeLabel(vehicle.fuelType)}</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">الفتيس</p>
                  <p className="font-bold">{getTransmissionLabel(vehicle.transmission)}</p>
                </div>
                {vehicle.mileage && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">الكيلومترات</p>
                    <p className="font-bold">{vehicle.mileage.toLocaleString()} كم</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          {(vehicle.engineCapacity || vehicle.horsepower || vehicle.seats || vehicle.doors) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  المواصفات التقنية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehicle.engineCapacity && (
                    <div>
                      <p className="text-sm text-gray-600">سعة المحرك</p>
                      <p className="font-bold">{vehicle.engineCapacity}</p>
                    </div>
                  )}
                  {vehicle.horsepower && (
                    <div>
                      <p className="text-sm text-gray-600">القوة</p>
                      <p className="font-bold">{vehicle.horsepower} حصان</p>
                    </div>
                  )}
                  {vehicle.seats && (
                    <div>
                      <p className="text-sm text-gray-600">المقاعد</p>
                      <p className="font-bold">{vehicle.seats} مقعد</p>
                    </div>
                  )}
                  {vehicle.doors && (
                    <div>
                      <p className="text-sm text-gray-600">الأبواب</p>
                      <p className="font-bold">{vehicle.doors} باب</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {featuresList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  المميزات والإضافات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {featuresList.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1 rounded-full text-sm font-medium text-purple-700"
                    >
                      ✨ {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {vehicle.descriptionAr && (
            <Card>
              <CardHeader>
                <CardTitle>الوصف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{vehicle.descriptionAr}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Left Column: Stats & Financial Info */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">📊 الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">المشاهدات</span>
                </div>
                <span className="font-bold text-lg">{vehicle.viewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">الاستفسارات</span>
                </div>
                <span className="font-bold text-lg">{vehicle.inquiries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CarFront className="w-4 h-4 text-green-600" />
                  <span className="text-sm">طلبات التجربة</span>
                </div>
                <span className="font-bold text-lg">{vehicle.testDrives.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">طلبات التمويل</span>
                </div>
                <span className="font-bold text-lg">{vehicle.financingApplications.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">💰 الأسعار والأرباح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">سعر الشراء</p>
                <p className="font-bold text-2xl text-red-700">
                  {vehicle.purchasePrice.toLocaleString()} ج.م
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">سعر البيع</p>
                <p className="font-bold text-2xl text-green-700">
                  {vehicle.sellingPrice.toLocaleString()} ج.م
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-lg text-white">
                <p className="text-sm opacity-90">الربح المتوقع</p>
                <p className="font-bold text-3xl">
                  {vehicle.profitAmount.toLocaleString()} ج.م
                </p>
                <p className="text-sm mt-1">
                  نسبة الربح: <span className="font-bold">{vehicle.profitMargin.toFixed(1)}%</span>
                </p>
              </div>
              {vehicle.negotiable && (
                <p className="text-sm text-center text-gray-600">
                  💬 السعر قابل للتفاوض
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bank Financing */}
          {vehicle.allowBankFinancing && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  التمويل البنكي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vehicle.minDownPayment && (
                  <div>
                    <p className="text-sm text-gray-600">الحد الأدنى للدفعة المقدمة</p>
                    <p className="font-bold text-lg">{vehicle.minDownPayment.toLocaleString()} ج.م</p>
                  </div>
                )}
                {vehicle.maxFinancingYears && (
                  <div>
                    <p className="text-sm text-gray-600">أقصى مدة تمويل</p>
                    <p className="font-bold text-lg">{vehicle.maxFinancingYears} سنوات</p>
                  </div>
                )}
                {banks.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">البنوك الشريكة:</p>
                    {banks.map((bank, index) => (
                      <span
                        key={index}
                        className="inline-block bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700 mr-2 mb-2"
                      >
                        🏦 {bank}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {(vehicle.location || vehicle.showroom) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  الموقع والمعرض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vehicle.showroom && (
                  <div>
                    <p className="text-sm text-gray-600">المعرض</p>
                    <p className="font-semibold">{vehicle.showroom}</p>
                  </div>
                )}
                {vehicle.location && (
                  <div>
                    <p className="text-sm text-gray-600">العنوان</p>
                    <p className="font-semibold">{vehicle.location}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vendor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                معلومات البائع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">اسم المعرض</p>
                <p className="font-semibold">{vehicle.vendor.businessNameAr || vehicle.vendor.businessName}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span>{vehicle.vendor.phone}</span>
              </div>
              {vehicle.vendor.address && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{vehicle.vendor.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                التواريخ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الإضافة:</span>
                <span className="font-medium">
                  {new Date(vehicle.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">آخر تحديث:</span>
                <span className="font-medium">
                  {new Date(vehicle.updatedAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
