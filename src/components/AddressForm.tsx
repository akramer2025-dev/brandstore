'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, User, Phone, Home, Building2, MapPinned, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddressFormData {
  fullName: string;
  phone: string;
  alternativePhone: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  floorNumber: string;
  apartmentNumber: string;
  landmark: string;
  postalCode: string;
  notes: string;
  saveAddress: boolean;
  addressTitle: string;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
}

export default function AddressForm({ formData, onChange, onCheckboxChange }: AddressFormProps) {
  const [governorates, setGovernorates] = useState<Array<{name: string, fee: number}>>([]);

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const fetchGovernorates = async () => {
    try {
      const response = await fetch('/api/admin/delivery-zones');
      if (response.ok) {
        const zones = await response.json();
        const activeGovs = zones
          .filter((z: any) => z.isActive)
          .map((z: any) => ({ name: z.governorate, fee: z.deliveryFee }));
        setGovernorates(activeGovs);
      }
    } catch (error) {
      console.error('Error fetching governorates:', error);
    }
  };

  const handleGovernorateChange = (value: string) => {
    const event = {
      target: {
        name: 'governorate',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <>
      {/* Personal Information */}
      <Card className="bg-gray-800/80 border-teal-500/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
            المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-300 mb-2 block">
                الاسم الكامل <span className="text-red-400">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={onChange}
                placeholder="أدخل اسمك الكامل"
                required
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-300 mb-2 block">
                رقم الهاتف <span className="text-red-400">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={onChange}
                placeholder="01xxxxxxxxx"
                required
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alternativePhone" className="text-gray-300 mb-2 block">
              رقم هاتف بديل (اختياري)
            </Label>
            <Input
              id="alternativePhone"
              name="alternativePhone"
              type="tel"
              value={formData.alternativePhone}
              onChange={onChange}
              placeholder="01xxxxxxxxx"
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card className="bg-gray-800/80 border-teal-500/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
            عنوان التوصيل التفصيلي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="governorate" className="text-gray-300 mb-2 block">
                المحافظة <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.governorate} onValueChange={handleGovernorateChange}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {governorates.map((gov) => (
                    <SelectItem key={gov.name} value={gov.name} className="text-white hover:bg-gray-700">
                      {gov.name} ({gov.fee} ج.م)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city" className="text-gray-300 mb-2 block">
                المدينة / المركز <span className="text-red-400">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={onChange}
                placeholder="مثال: القاهرة الجديدة"
                required
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="district" className="text-gray-300 mb-2 block">
              الحي / المنطقة <span className="text-red-400">*</span>
            </Label>
            <Input
              id="district"
              name="district"
              value={formData.district}
              onChange={onChange}
              placeholder="مثال: التجمع الخامس"
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="street" className="text-gray-300 mb-2 block">
              اسم الشارع <span className="text-red-400">*</span>
            </Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={onChange}
              placeholder="اسم الشارع الرئيسي"
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buildingNumber" className="text-gray-300 mb-2 block">
                رقم العمارة / المبنى
              </Label>
              <Input
                id="buildingNumber"
                name="buildingNumber"
                value={formData.buildingNumber}
                onChange={onChange}
                placeholder="رقم العمارة"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="floorNumber" className="text-gray-300 mb-2 block">
                رقم الطابق
              </Label>
              <Input
                id="floorNumber"
                name="floorNumber"
                value={formData.floorNumber}
                onChange={onChange}
                placeholder="رقم الطابق"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="apartmentNumber" className="text-gray-300 mb-2 block">
                رقم الشقة
              </Label>
              <Input
                id="apartmentNumber"
                name="apartmentNumber"
                value={formData.apartmentNumber}
                onChange={onChange}
                placeholder="رقم الشقة"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="landmark" className="text-gray-300 mb-2 block">
                أقرب معلم مشهور
              </Label>
              <Input
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={onChange}
                placeholder="مثال: بجوار مستشفى كذا"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="postalCode" className="text-gray-300 mb-2 block">
                الرمز البريدي
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={onChange}
                placeholder="الرمز البريدي (إن وجد)"
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-gray-300 mb-2 block">
              ملاحظات إضافية (اختياري)
            </Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="أي ملاحظات خاصة بالطلب أو التوصيل (مثال: يفضل الاتصال قبل الوصول)"
              rows={3}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* حفظ العنوان */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-teal-900/20 border border-teal-500/30">
              <Checkbox
                id="saveAddress"
                checked={formData.saveAddress}
                onCheckedChange={onCheckboxChange}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="saveAddress" className="text-white cursor-pointer font-medium">
                  💾 حفظ هذا العنوان للطلبات القادمة
                </Label>
                <p className="text-xs text-gray-400 mt-1">
                  لن تحتاج لإدخال عنوانك في كل مرة
                </p>
                
                {formData.saveAddress && (
                  <div className="mt-3">
                    <Label htmlFor="addressTitle" className="text-gray-300 mb-2 block text-sm">
                      اسم العنوان <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="addressTitle"
                      name="addressTitle"
                      value={formData.addressTitle}
                      onChange={onChange}
                      placeholder="مثال: المنزل، العمل، عند الأم، الخ"
                      required={formData.saveAddress}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
