"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Car, Upload, DollarSign, Info, Image as ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  Label } from "@/components/ui/label";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function AddVehiclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // أساسي
    type: "CAR",
    condition: "USED",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    
    // مستعمل فقط
    mileage: "",
    previousOwners: "",
    accidentHistory: false,
    accidentDetails: "",
    maintenanceHistory: "",
    licensePlate: "",
    
    // المواصفات
    engineCapacity: "",
    horsepower: "",
    seats: "",
    doors: "",
    bodyType: "",
    
    // المميزات
    features: "",
    hasWarranty: false,
    warrantyDetails: "",
    hasFreeService: false,
    freeServiceDetails: "",
    
    // الأسعار
    purchasePrice: "",
    sellingPrice: "",
    marketingPrice: "",
    negotiable: true,
    
    // التمويل البنكي
    allowBankFinancing: false,
    minDownPayment: "",
    maxFinancingYears: "",
    partnerBanks: "",
    
    // الوصف
    description: "",
    descriptionAr: "",
    sellerNotes: "",
    internalNotes: "",
    
    // الصور
    images: "",
    featuredImage: "",
    videoUrl: "",
    
    // الموقع
    location: "",
    showroom: "",
    isAvailable: true,
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session && session.user?.role !== "VENDOR" && session.user?.role !== "ADMIN") {
      redirect("/");
    }
  }, [session, status]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    if (!formData.brand || !formData.model || !formData.purchasePrice || !formData.sellingPrice) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/vendor/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في إضافة المركبة");
      }

      const { vehicle } = await response.json();
      alert("✅ تم إضافة المركبة بنجاح!");
      router.push(`/vendor/vehicles/${vehicle.id}`);
    } catch (error: any) {
      console.error("Error adding vehicle:", error);
      alert(error.message || "حدث خطأ أثناء إضافة المركبة");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <Link href="/vendor/vehicles">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-white/20 rounded-xl">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">🚗 إضافة مركبة جديدة</h1>
                <p className="text-white/90 mt-1">سيارة أو موتوسيكل للبيع</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. البيانات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                البيانات الأساسية
              </CardTitle>
              <CardDescription>معلومات المركبة الرئيسية</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع المركبة *</Label>
                <Select value={formData.type} onValueChange={(val) => handleChange("type", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">🚗 سيارة</SelectItem>
                    <SelectItem value="MOTORCYCLE">🏍️ موتوسيكل</SelectItem>
                    <SelectItem value="TRUCK">🚚 شاحنة</SelectItem>
                    <SelectItem value="VAN">🚐 فان</SelectItem>
                    <SelectItem value="BUS">🚌 حافلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">الحالة *</Label>
                <Select value={formData.condition} onValueChange={(val) => handleChange("condition", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">✨ جديد</SelectItem>
                    <SelectItem value="USED">🔧 مستعمل</SelectItem>
                    <SelectItem value="CERTIFIED">✅ معتمد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">الماركة *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="مثال: تويوتا، هوندا، BMW"
                  required
                />
              </div>

              <div>
                <Label htmlFor="model">الموديل *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="مثال: كامري، أكورد، X5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="year">سنة الصنع *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange("year", parseInt(e.target.value))}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <Label htmlFor="color">اللون *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="مثال: أبيض، أسود، فضي"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fuelType">نوع الوقود *</Label>
                <Select value={formData.fuelType} onValueChange={(val) => handleChange("fuelType", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PETROL">⛽ بنزين</SelectItem>
                    <SelectItem value="DIESEL">🛢️ ديزل</SelectItem>
                    <SelectItem value="ELECTRIC">🔋 كهربائي</SelectItem>
                    <SelectItem value="HYBRID">⚡ هجين</SelectItem>
                    <SelectItem value="LPG">🌿 غاز طبيعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transmission">ناقل الحركة *</Label>
                <Select value={formData.transmission} onValueChange={(val) => handleChange("transmission", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">🔧 يدوي (مانيوال)</SelectItem>
                    <SelectItem value="AUTOMATIC">⚙️ أوتوماتيك</SelectItem>
                    <SelectItem value="CVT">🔄 CVT</SelectItem>
                    <SelectItem value="SEMI_AUTO">🔀 نصف أوتوماتيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 2. بيانات المركبة المستعملة */}
          {formData.condition === "USED" && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  🔧 بيانات المركبة المستعملة
                </CardTitle>
                <CardDescription>معلومات إضافية للمركبات المستعملة</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">عداد الكيلومترات *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange("mileage", e.target.value)}
                    placeholder="مثال: 50000"
                    required={formData.condition === "USED"}
                  />
                </div>

                <div>
                  <Label htmlFor="previousOwners">عدد الملاك السابقين</Label>
                  <Input
                    id="previousOwners"
                    type="number"
                    value={formData.previousOwners}
                    onChange={(e) => handleChange("previousOwners", e.target.value)}
                    placeholder="مثال: 1"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="licensePlate">رقم اللوحة</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => handleChange("licensePlate", e.target.value)}
                    placeholder="مثال: أ ب ج 1234"
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse pt-7">
                  <Checkbox
                    id="accidentHistory"
                    checked={formData.accidentHistory}
                    onCheckedChange={(checked) => handleChange("accidentHistory", checked)}
                  />
                  <Label htmlFor="accidentHistory" className="cursor-pointer">
                    يوجد تاريخ حوادث
                  </Label>
                </div>

                {formData.accidentHistory && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="accidentDetails">تفاصيل الحوادث</Label>
                    <Textarea
                      id="accidentDetails"
                      value={formData.accidentDetails}
                      onChange={(e) => handleChange("accidentDetails", e.target.value)}
                      placeholder="اشرح تفاصيل الحوادث والإصلاحات..."
                      rows={3}
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <Label htmlFor="maintenanceHistory">سجل الصيانة</Label>
                  <Textarea
                    id="maintenanceHistory"
                    value={formData.maintenanceHistory}
                    onChange={(e) => handleChange("maintenanceHistory", e.target.value)}
                    placeholder="اذكر آخر صيانات تمت للمركبة..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. المواصفات التقنية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ المواصفات التقنية
              </CardTitle>
              <CardDescription>التفاصيل الفنية والمواصفات</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engineCapacity">سعة المحرك</Label>
                <Input
                  id="engineCapacity"
                  value={formData.engineCapacity}
                  onChange={(e) => handleChange("engineCapacity", e.target.value)}
                  placeholder="مثال: 1600cc"
                />
              </div>

              <div>
                <Label htmlFor="horsepower">قوة الحصان (HP)</Label>
                <Input
                  id="horsepower"
                  type="number"
                  value={formData.horsepower}
                  onChange={(e) => handleChange("horsepower", e.target.value)}
                  placeholder="مثال: 150"
                />
              </div>

              {formData.type === "CAR" && (
                <>
                  <div>
                    <Label htmlFor="seats">عدد المقاعد</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={formData.seats}
                      onChange={(e) => handleChange("seats", e.target.value)}
                      placeholder="مثال: 5"
                      min="2"
                      max="20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="doors">عدد الأبواب</Label>
                    <Input
                      id="doors"
                      type="number"
                      value={formData.doors}
                      onChange={(e) => handleChange("doors", e.target.value)}
                      placeholder="مثال: 4"
                      min="2"
                      max="6"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="bodyType">نوع الهيكل</Label>
                    <Input
                      id="bodyType"
                      value={formData.bodyType}
                      onChange={(e) => handleChange("bodyType", e.target.value)}
                      placeholder="مثال: سيدان، SUV، هاتشباك، كوبيه"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. المميزات والإضافات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ المميزات والإضافات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="features">المميزات</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleChange("features", e.target.value)}
                  placeholder="اذكر المميزات مفصولة بفاصلة: فتحة سقف، كاميرا خلفية، سنسر، شاشة، مقاعد جلد، تحكم كروز..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasWarranty"
                    checked={formData.hasWarranty}
                    onCheckedChange={(checked) => handleChange("hasWarranty", checked)}
                  />
                  <Label htmlFor="hasWarranty" className="cursor-pointer">
                    يوجد ضمان
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="hasFreeService"
                    checked={formData.hasFreeService}
                    onCheckedChange={(checked) => handleChange("hasFreeService", checked)}
                  />
                  <Label htmlFor="hasFreeService" className="cursor-pointer">
                    يوجد صيانة مجانية
                  </Label>
                </div>
              </div>

              {formData.hasWarranty && (
                <div>
                  <Label htmlFor="warrantyDetails">تفاصيل الضمان</Label>
                  <Textarea
                    id="warrantyDetails"
                    value={formData.warrantyDetails}
                    onChange={(e) => handleChange("warrantyDetails", e.target.value)}
                    placeholder="مثال: ضمان سنة أو 20000 كم أيهما أقل"
                    rows={2}
                  />
                </div>
              )}

              {formData.hasFreeService && (
                <div>
                  <Label htmlFor="freeServiceDetails">تفاصيل الصيانة المجانية</Label>
                  <Textarea
                    id="freeServiceDetails"
                    value={formData.freeServiceDetails}
                    onChange={(e) => handleChange("freeServiceDetails", e.target.value)}
                    placeholder="مثال: 3 صيانات مجانية خلال السنة الأولى"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. الأسعار */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <DollarSign className="w-5 h-5" />
                الأسعار والأرباح
              </CardTitle>
              <CardDescription>سعر الشراء والبيع لحساب الربح</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice" className="text-red-700">سعر الشراء (من المورد) *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => handleChange("purchasePrice", e.target.value)}
                    placeholder="0.00"
                    required
                    className="bg-red-50"
                  />
                </div>

                <div>
                  <Label htmlFor="sellingPrice" className="text-green-700">سعر البيع (للعميل) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => handleChange("sellingPrice", e.target.value)}
                    placeholder="0.00"
                    required
                    className="bg-green-50"
                  />
                </div>

                <div>
                  <Label htmlFor="marketingPrice">سعر الإعلان (اختياري)</Label>
                  <Input
                    id="marketingPrice"
                    type="number"
                    step="0.01"
                    value={formData.marketingPrice}
                    onChange={(e) => handleChange("marketingPrice", e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">إذا كان مختلفاً عن سعر البيع</p>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse pt-7">
                  <Checkbox
                    id="negotiable"
                    checked={formData.negotiable}
                    onCheckedChange={(checked) => handleChange("negotiable", checked)}
                  />
                  <Label htmlFor="negotiable" className="cursor-pointer">
                    السعر قابل للتفاوض
                  </Label>
                </div>
              </div>

              {/* عرض الربح المحسوب */}
              {formData.purchasePrice && formData.sellingPrice && (
                <div className="p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-green-900 mb-2">💰 حساب الربح:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">مبلغ الربح:</span>
                      <span className="font-bold text-green-700 mr-2">
                        {(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)).toLocaleString()} ج.م
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">نسبة الربح:</span>
                      <span className="font-bold text-green-700 mr-2">
                        {(((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 6. نظام التمويل البنكي */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                🏦 نظام التمويل البنكي
              </CardTitle>
              <CardDescription>إتاحة التمويل البنكي للعملاء (أمان، تمويل سيارة، إلخ)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="allowBankFinancing"
                  checked={formData.allowBankFinancing}
                  onCheckedChange={(checked) => handleChange("allowBankFinancing", checked)}
                />
                <Label htmlFor="allowBankFinancing" className="cursor-pointer font-semibold">
                  السماح بالتمويل البنكي
                </Label>
              </div>

              {formData.allowBankFinancing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="minDownPayment">الحد الأدنى للدفعة المقدمة</Label>
                    <Input
                      id="minDownPayment"
                      type="number"
                      step="0.01"
                      value={formData.minDownPayment}
                      onChange={(e) => handleChange("minDownPayment", e.target.value)}
                      placeholder="مثال: 30000"
                    />
                    <p className="text-xs text-gray-500 mt-1">بالجنيه المصري</p>
                  </div>

                  <div>
                    <Label htmlFor="maxFinancingYears">أقصى مدة تمويل (بالسنوات)</Label>
                    <Input
                      id="maxFinancingYears"
                      type="number"
                      value={formData.maxFinancingYears}
                      onChange={(e) => handleChange("maxFinancingYears", e.target.value)}
                      placeholder="مثال: 5"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="partnerBanks">البنوك الشريكة</Label>
                    <Input
                      id="partnerBanks"
                      value={formData.partnerBanks}
                      onChange={(e) => handleChange("partnerBanks", e.target.value)}
                      placeholder="مثال: بنك أمان، تمويل سيارة، البنك الأهلي (مفصولة بفاصلة)"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7. الوصف */}
          <Card>
            <CardHeader>
              <CardTitle>📝 الوصف والملاحظات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descriptionAr">وصف المركبة (بالعربية)</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) => handleChange("descriptionAr", e.target.value)}
                  placeholder="اكتب وصفاً تفصيلياً للمركبة..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="description">وصف المركبة (بالإنجليزية) - اختياري</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Optional English description..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="sellerNotes">ملاحظات إضافية للعميل</Label>
                <Textarea
                  id="sellerNotes"
                  value={formData.sellerNotes}
                  onChange={(e) => handleChange("sellerNotes", e.target.value)}
                  placeholder="ملاحظات مهمة لتظهر للعملاء..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="internalNotes">ملاحظات داخلية (لا تظهر للعميل)</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => handleChange("internalNotes", e.target.value)}
                  placeholder="ملاحظات خاصة بالمعرض..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* 8. الصور والفيديوهات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                الصور والفيديوهات
              </CardTitle>
              <CardDescription>أضف صور المركبة (مفصولة بفاصلة)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featuredImage">الصورة الرئيسية (URL)</Label>
                <Input
                  id="featuredImage"
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => handleChange("featuredImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="images">الصور الإضافية (URLs مفصولة بفاصلة)</Label>
                <Textarea
                  id="images"
                  value={formData.images}
                  onChange={(e) => handleChange("images", e.target.value)}
                  placeholder="https://example.com/image1.jpg,https://example.com/image2.jpg"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">رابط فيديو (يوتيوب مثلاً) - اختياري</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* 9. الموقع */}
          <Card>
            <CardHeader>
              <CardTitle>📍 الموقع والمعرض</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="مثال: القاهرة - مدينة نصر"
                />
              </div>

              <div>
                <Label htmlFor="showroom">اسم المعرض</Label>
                <Input
                  id="showroom"
                  value={formData.showroom}
                  onChange={(e) => handleChange("showroom", e.target.value)}
                  placeholder="مثال: معرض النصر للسيارات"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => handleChange("isAvailable", checked)}
                  />
                  <Label htmlFor="isAvailable" className="cursor-pointer">
                    متاح للبيع الآن
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleChange("isFeatured", checked)}
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    مميز (سيظهر في الصفحة الرئيسية)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    نشط (قابل للظهور في الموقع)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 py-6 text-lg">
              {loading ? "جاري الإضافة..." : "✅ إضافة المركبة"}
            </Button>
            <Link href="/vendor/vehicles" className="flex-1">
              <Button type="button" variant="outline" className="w-full py-6 text-lg">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
