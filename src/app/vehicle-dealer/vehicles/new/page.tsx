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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/vehicle-dealer/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚗 إضافة مركبة جديدة
          </h1>
          <p className="text-gray-600 mt-2">
            املأ البيانات التالية لإضافة سيارة أو موتوسيكل جديد لمعرضك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>بيانات المركبة الرئيسية</CardDescription>
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

          {/* Used Vehicle Data */}
          {formData.condition === 'USED' && (
            <Card>
              <CardHeader>
                <CardTitle>بيانات المركبة المستعملة</CardTitle>
                <CardDescription>معلومات خاصة بالمركبات المستعملة</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>عداد الكيلومترات *</Label>
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange('mileage', e.target.value)}
                    placeholder="مثال: 50000"
                    required
                  />
                </div>

                <div>
                  <Label>عدد الملاك السابقين</Label>
                  <Input
                    type="number"
                    value={formData.previousOwners}
                    onChange={(e) => handleChange('previousOwners', e.target.value)}
                    placeholder="مثال: 1"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="accidentHistory"
                      checked={formData.accidentHistory}
                      onChange={(e) => handleChange('accidentHistory', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="accidentHistory">المركبة لها تاريخ حوادث</Label>
                  </div>
                  {formData.accidentHistory && (
                    <Textarea
                      value={formData.accidentDetails}
                      onChange={(e) => handleChange('accidentDetails', e.target.value)}
                      placeholder="اذكر تفاصيل الحوادث..."
                      rows={3}
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>سجل الصيانة</Label>
                  <Textarea
                    value={formData.maintenanceHistory}
                    onChange={(e) => handleChange('maintenanceHistory', e.target.value)}
                    placeholder="اكتب سجل الصيانة..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>رقم اللوحة</Label>
                  <Input
                    value={formData.licensePlate}
                    onChange={(e) => handleChange('licensePlate', e.target.value)}
                    placeholder="مثال: أ ب ج 1234"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>الأسعار والتكاليف</CardTitle>
              <CardDescription>حدد أسعار الشراء والبيع</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>نظام التمويل البنكي 🏦</CardTitle>
              <CardDescription>إعدادات التمويل المصرفي للمركبة</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>الوصف والملاحظات</CardTitle>
              <CardDescription>وصف تفصيلي للمركبة</CardDescription>
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
