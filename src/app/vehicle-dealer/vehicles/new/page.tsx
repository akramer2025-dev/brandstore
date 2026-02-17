'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    type: 'CAR',
    condition: 'NEW',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    
    // Used Vehicle Data
    mileage: '',
    previousOwners: '',
    accidentHistory: false,
    accidentDetails: '',
    maintenanceHistory: '',
    licensePlate: '',
    
    // Technical Specs
    engineCapacity: '',
    horsepower: '',
    seats: '',
    doors: '',
    bodyType: '',
    
    // Features
    features: '',
    hasWarranty: false,
    warrantyDetails: '',
    hasFreeService: false,
    freeServiceDetails: '',
    
    // Pricing
    purchasePrice: '',
    sellingPrice: '',
    marketingPrice: '',
    negotiable: true,
    
    // Bank Financing
    allowBankFinancing: false,
    minDownPayment: '',
    maxFinancingYears: '',
    partnerBanks: '',
    
    // Description
    description: '',
    descriptionAr: '',
    sellerNotes: '',
    internalNotes: '',
    
    // Location
    location: '',
    showroom: '',
    
    // Status
    isFeatured: false,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vehicle-dealer/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'حدث خطأ');
      }

      const data = await response.json();
      toast.success('تم إضافة المركبة بنجاح! ✅');
      router.push(`/vehicle-dealer/vehicles/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إضافة المركبة');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/vehicle-dealer/dashboard">
            <Button variant="ghost" className="mb-4 hover:bg-white/50">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </Link>
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/40 shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              🚗 إضافة مركبة جديدة
            </h1>
            <p className="text-gray-700 mt-2 font-medium">
              املأ جميع البيانات التفصيلية لإضافة سيارة أو موتوسيكل جديد لمعرضك
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/60 backdrop-blur-lg border-2 border-purple-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10">
              <CardTitle className="text-purple-700 text-xl">🎯 المعلومات الأساسية</CardTitle>
              <CardDescription className="text-gray-700">بيانات المركبة الرئيسية</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>نوع المركبة *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">سيارة</SelectItem>
                    <SelectItem value="MOTORCYCLE">موتوسيكل</SelectItem>
                    <SelectItem value="TRUCK">شاحنة</SelectItem>
                    <SelectItem value="VAN">فان</SelectItem>
                    <SelectItem value="BUS">حافلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الحالة *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => handleChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">جديد</SelectItem>
                    <SelectItem value="USED">مستعمل</SelectItem>
                    <SelectItem value="CERTIFIED">معتمد (مستعمل مع ضمان)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الماركة *</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="مثال: تويوتا، هوندا"
                  required
                />
              </div>

              <div>
                <Label>الموديل *</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="مثال: كامري، أكورد"
                  required
                />
              </div>

              <div>
                <Label>سنة الصنع *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', parseInt(e.target.value))}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <Label>اللون *</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="مثال: أبيض، أسود، فضي"
                  required
                />
              </div>

              <div>
                <Label>نوع الوقود *</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value) => handleChange('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PETROL">بنزين</SelectItem>
                    <SelectItem value="DIESEL">ديزل</SelectItem>
                    <SelectItem value="ELECTRIC">كهربائي</SelectItem>
                    <SelectItem value="HYBRID">هجين</SelectItem>
                    <SelectItem value="LPG">غاز طبيعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ناقل الحركة *</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) => handleChange('transmission', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">يدوي</SelectItem>
                    <SelectItem value="AUTOMATIC">أوتوماتيك</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                    <SelectItem value="SEMI_AUTO">نصف أوتوماتيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card className="bg-white/60 backdrop-blur-lg border-2 border-blue-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10">
              <CardTitle className="text-blue-700 text-xl">⚙️ المواصفات التقنية</CardTitle>
              <CardDescription className="text-gray-700">المواصفات الفنية والتقنية للمركبة</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>سعة المحرك 🔧</Label>
                <Input
                  value={formData.engineCapacity}
                  onChange={(e) => handleChange('engineCapacity', e.target.value)}
                  placeholder="مثال: 1600cc أو 2.0L"
                />
              </div>

              <div>
                <Label>قوة الحصان 🏇</Label>
                <Input
                  type="number"
                  value={formData.horsepower}
                  onChange={(e) => handleChange('horsepower', e.target.value)}
                  placeholder="مثال: 150"
                />
              </div>

              {formData.type === 'CAR' && (
                <>
                  <div>
                    <Label>عدد المقاعد 💺</Label>
                    <Input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => handleChange('seats', e.target.value)}
                      placeholder="مثال: 5"
                      min="2"
                      max="50"
                    />
                  </div>

                  <div>
                    <Label>عدد الأبواب 🚪</Label>
                    <Input
                      type="number"
                      value={formData.doors}
                      onChange={(e) => handleChange('doors', e.target.value)}
                      placeholder="مثال: 4"
                      min="2"
                      max="6"
                    />
                  </div>

                  <div>
                    <Label>نوع الهيكل 🚘</Label>
                    <Select
                      value={formData.bodyType}
                      onValueChange={(value) => handleChange('bodyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الهيكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEDAN">سيدان</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="HATCHBACK">هاتشباك</SelectItem>
                        <SelectItem value="COUPE">كوبيه</SelectItem>
                        <SelectItem value="PICKUP">بيك أب</SelectItem>
                        <SelectItem value="VAN">فان</SelectItem>
                        <SelectItem value="WAGON">ستيشن واجن</SelectItem>
                        <SelectItem value="CONVERTIBLE">مكشوفة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <Label>المميزات والإضافات ✨</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => handleChange('features', e.target.value)}
                  placeholder="مثال: فتحة سقف، شاشة لمس، كاميرا 360، سنسر، مقاعد جلد، تحكم مناخي، نظام ملاحة"
                  rows={3}
                  className="bg-white/80"
                />
                <p className="text-xs text-gray-600 mt-1">💡 اذكر كل المميزات مفصولة بفواصل</p>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="hasWarranty"
                      checked={formData.hasWarranty}
                      onChange={(e) => handleChange('hasWarranty', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="hasWarranty" className="font-bold text-green-700">🛡️ يوجد ضمان</Label>
                  </div>
                  {formData.hasWarranty && (
                    <Input
                      value={formData.warrantyDetails}
                      onChange={(e) => handleChange('warrantyDetails', e.target.value)}
                      placeholder="تفاصيل الضمان (مثال: سنة أو 100,000 كم)"
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="hasFreeService"
                      checked={formData.hasFreeService}
                      onChange={(e) => handleChange('hasFreeService', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="hasFreeService" className="font-bold text-blue-700">🔧 صيانة مجانية</Label>
                  </div>
                  {formData.hasFreeService && (
                    <Input
                      value={formData.freeServiceDetails}
                      onChange={(e) => handleChange('freeServiceDetails', e.target.value)}
                      placeholder="تفاصيل الصيانة (مثال: 3 صيانات مجانية)"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Used Vehicle Data */}
          {formData.condition === 'USED' && (
            <Card className="bg-white/60 backdrop-blur-lg border-2 border-orange-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10">
                <CardTitle className="text-orange-700 text-xl">📊 بيانات المركبة المستعملة</CardTitle>
                <CardDescription className="text-gray-700">معلومات خاصة بالمركبات المستعملة</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>عداد الكيلومترات * 🛣️</Label>
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange('mileage', e.target.value)}
                    placeholder="مثال: 50000"
                    required
                    className="bg-white/80"
                  />
                  <p className="text-xs text-gray-600 mt-1">كم قطعت المركبة من الكيلومترات</p>
                </div>

                <div>
                  <Label>عدد الملاك السابقين 👤</Label>
                  <Input
                    type="number"
                    value={formData.previousOwners}
                    onChange={(e) => handleChange('previousOwners', e.target.value)}
                    placeholder="مثال: 1"
                    min="0"
                    className="bg-white/80"
                  />
                  <p className="text-xs text-gray-600 mt-1">كم مالك امتلك هذه المركبة من قبل</p>
                </div>

                <div className="md:col-span-2">
                  <Label>رقم اللوحة 🔢</Label>
                  <Input
                    value={formData.licensePlate}
                    onChange={(e) => handleChange('licensePlate', e.target.value)}
                    placeholder="مثال: أ ب ج 1234"
                    className="bg-white/80"
                  />
                </div>

                {/* Accident History Section */}
                <div className="md:col-span-2 bg-red-50/60 backdrop-blur-sm p-5 rounded-xl border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="accidentHistory"
                      checked={formData.accidentHistory}
                      onChange={(e) => handleChange('accidentHistory', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="accidentHistory" className="text-lg font-bold text-red-700">
                      ⚠️ المركبة لها تاريخ حوادث أو خبطات
                    </Label>
                  </div>
                  {formData.accidentHistory && (
                    <div className="space-y-3 mt-4">
                      <Textarea
                        value={formData.accidentDetails}
                        onChange={(e) => handleChange('accidentDetails', e.target.value)}
                        placeholder="اذكر تفاصيل الحوادث بالكامل:&#10;- نوع الحادث (خبطة خفيفة، متوسطة، شديدة)&#10;- مكان الإصابة (أمامي، خلفي، جانبي)&#10;- هل تم التصليح؟&#10;- المبلغ المصروف على التصليح&#10;- في أي ورشة تم التصليح&#10;- هل تم تغيير قطع؟"
                        rows={6}
                        className="bg-white/90"
                      />
                      <p className="text-sm text-red-600 font-semibold">
                        ⚡ مهم: كن صادقاً في ذكر تفاصيل الحوادث - الشفافية تبني الثقة مع العملاء
                      </p>
                    </div>
                  )}
                </div>

                {/* Maintenance & Replacements */}
                <div className="md:col-span-2 bg-blue-50/60 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200">
                  <Label className="text-lg font-bold text-blue-700 mb-3 block">🔧 سجل الصيانة والتصليحات</Label>
                  <Textarea
                    value={formData.maintenanceHistory}
                    onChange={(e) => handleChange('maintenanceHistory', e.target.value)}
                    placeholder="اكتب سجل الصيانة بالتفصيل:&#10;&#10;📅 تاريخ آخر صيانة دورية:&#10;🔧 الأعمال المنفذة:&#10;  - تغيير زيت المحرك&#10;  - فلاتر الهواء والزيت&#10;  - فحص الفرامل&#10;  - إلخ...&#10;&#10;🔩 القطع التي تم استبدالها:&#10;  - البطارية (تاريخ التغيير)&#10;  - الإطارات (4 إطارات جديدة)&#10;  - وسادات الفرامل&#10;  - أي قطع أخرى...&#10;&#10;💰 المبالغ المصروفة على الصيانة:&#10;&#10;📍 أماكن الصيانة (توكيل رسمي أو ورشة):"
                    rows={10}
                    className="bg-white/90"
                  />
                </div>

                {/* Color Options */}
                <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
                  <Label className="text-lg font-bold text-purple-700 mb-3 block">🎨 لون المركبة بالتفصيل</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>اللون الأساسي *</Label>
                      <Select
                        value={formData.color}
                        onValueChange={(value) => handleChange('color', value)}
                      >
                        <SelectTrigger className="bg-white/90">
                          <SelectValue placeholder="اختر اللون" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="أبيض">⚪ أبيض</SelectItem>
                          <SelectItem value="أسود">⚫ أسود</SelectItem>
                          <SelectItem value="فضي">🔘 فضي</SelectItem>
                          <SelectItem value="رمادي">⚫ رمادي</SelectItem>
                          <SelectItem value="أحمر">🔴 أحمر</SelectItem>
                          <SelectItem value="أزرق">🔵 أزرق</SelectItem>
                          <SelectItem value="أخضر">🟢 أخضر</SelectItem>
                          <SelectItem value="أصفر">🟡 أصفر</SelectItem>
                          <SelectItem value="برتقالي">🟠 برتقالي</SelectItem>
                          <SelectItem value="بني">🟤 بني</SelectItem>
                          <SelectItem value="ذهبي">🟡 ذهبي</SelectItem>
                          <SelectItem value="بيج">🟤 بيج</SelectItem>
                          <SelectItem value="زيتي">🟢 زيتي</SelectItem>
                          <SelectItem value="بنفسجي">🟣 بنفسجي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>وصف تفصيلي للون</Label>
                      <Input
                        placeholder="مثال: أبيض لؤلؤي لامع، أزرق سماوي متاليك، أسود مط"
                        className="bg-white/90"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          <Card className="bg-white/60 backdrop-blur-lg border-2 border-green-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10">
              <CardTitle className="text-green-700 text-xl">💰 الأسعار والتكاليف</CardTitle>
              <CardDescription className="text-gray-700">حدد أسعار الشراء والبيع وهامش الربح</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>سعر الشراء (التكلفة) * 💵</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  placeholder="المبلغ الذي دفعته"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label>سعر البيع * 💰</Label>
                <Input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', e.target.value)}
                  placeholder="السعر النهائي للبيع"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label>سعر الإعلان (اختياري) 📢</Label>
                <Input
                  type="number"
                  value={formData.marketingPrice}
                  onChange={(e) => handleChange('marketingPrice', e.target.value)}
                  placeholder="سعر الإعلان (يمكن أن يختلف)"
                  step="0.01"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mt-8">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={formData.negotiable}
                    onChange={(e) => handleChange('negotiable', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="negotiable">قابل للتفاوض</Label>
                </div>
              </div>

              {formData.purchasePrice && formData.sellingPrice && (
                <div className="md:col-span-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">هامش الربح</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">مبلغ الربح</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)).toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Financing */}
          <Card className="bg-white/60 backdrop-blur-lg border-2 border-indigo-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
              <CardTitle className="text-indigo-700 text-xl">🏦 نظام التمويل البنكي</CardTitle>
              <CardDescription className="text-gray-700">إعدادات التمويل المصرفي للمركبة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowBankFinancing"
                  checked={formData.allowBankFinancing}
                  onChange={(e) => handleChange('allowBankFinancing', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="allowBankFinancing" className="text-lg font-semibold">
                  السماح بالتمويل البنكي لهذه المركبة
                </Label>
              </div>

              {formData.allowBankFinancing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <Label>الحد الأدنى للدفعة المقدمة</Label>
                    <Input
                      type="number"
                      value={formData.minDownPayment}
                      onChange={(e) => handleChange('minDownPayment', e.target.value)}
                      placeholder="مثال: 50000"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label>أقصى مدة تمويل (بالسنوات)</Label>
                    <Input
                      type="number"
                      value={formData.maxFinancingYears}
                      onChange={(e) => handleChange('maxFinancingYears', e.target.value)}
                      placeholder="مثال: 5"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>البنوك الشريكة (مفصولة بفواصل)</Label>
                    <Input
                      value={formData.partnerBanks}
                      onChange={(e) => handleChange('partnerBanks', e.target.value)}
                      placeholder="مثال: بنك أمان، تمويل سيارة، البنك الأهلي"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-white/60 backdrop-blur-lg border-2 border-pink-200/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-red-500/10">
              <CardTitle className="text-pink-700 text-xl">📝 الوصف والملاحظات</CardTitle>
              <CardDescription className="text-gray-700">وصف تفصيلي وملاحظات إضافية عن المركبة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>الوصف بالعربية</Label>
                <Textarea
                  value={formData.descriptionAr}
                  onChange={(e) => handleChange('descriptionAr', e.target.value)}
                  placeholder="اكتب وصفاً تفصيلياً للمركبة..."
                  rows={5}
                />
              </div>

              <div>
                <Label>المميزات (مفصولة بفواصل)</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => handleChange('features', e.target.value)}
                  placeholder="مثال: فتحة سقف، كاميرا خلفية، سنسر، مقاعد جلد"
                  rows={3}
                />
              </div>

              <div>
                <Label>ملاحظات البائع</Label>
                <Textarea
                  value={formData.sellerNotes}
                  onChange={(e) => handleChange('sellerNotes', e.target.value)}
                  placeholder="ملاحظات إضافية..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/vehicle-dealer/dashboard">
              <Button type="button" variant="outline">
                إلغاء
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                'جاري الحفظ...'
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ المركبة
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
