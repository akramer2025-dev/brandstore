// src/app/vendor/store-address/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Save, AlertCircle } from 'lucide-react';

interface VendorAddress {
  address?: string;
  governorate?: string;
  city?: string;
  region?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  postalCode?: string;
  pickupInstructions?: string;
}

export default function StoreAddressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<VendorAddress>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (session?.user?.role !== 'VENDOR') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vendor/store-address');
      if (response.ok) {
        const data = await response.json();
        setAddress(data);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('فشل تحميل بيانات العنوان');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!address.governorate || !address.city || !address.street) {
      toast.error('الرجاء إضافة المحافظة والمدينة واسم الشارع على الأقل');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/vendor/store-address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });

      if (response.ok) {
        toast.success('✅ تم حفظ عنوان المتجر بنجاح');
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل حفظ العنوان');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof VendorAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          عنوان المتجر
        </h1>
        <p className="text-gray-600 mt-2">
          العنوان المطلوب لاستلام الشحنات من شركة بوسطة
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900">مهم جداً</h3>
          <p className="text-blue-800 text-sm mt-1">
            عنوان المتجر مطلوب لشحن الطلبات مع شركة بوسطة. ستقوم الشركة باستلام الطلبات من هذا العنوان وتوصيلها للعملاء.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل العنوان</CardTitle>
            <CardDescription>
              أضف عنوان متجرك بالتفصيل لضمان استلام الشحنات بشكل صحيح
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Governorate & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="governorate">المحافظة *</Label>
                <Input
                  id="governorate"
                  value={address.governorate || ''}
                  onChange={(e) => handleChange('governorate', e.target.value)}
                  placeholder="مثال: القاهرة"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">المدينة / المركز *</Label>
                <Input
                  id="city"
                  value={address.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="مثال: مدينة نصر"
                  required
                />
              </div>
            </div>

            {/* District & Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">الحي / المنطقة</Label>
                <Input
                  id="region"
                  value={address.region || ''}
                  onChange={(e) => handleChange('region', e.target.value)}
                  placeholder="مثال: الحي العاشر"
                />
              </div>
              <div>
                <Label htmlFor="district">القسم</Label>
                <Input
                  id="district"
                  value={address.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="مثال: قسم أول"
                />
              </div>
            </div>

            {/* Street */}
            <div>
              <Label htmlFor="street">اسم الشارع *</Label>
              <Input
                id="street"
                value={address.street || ''}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="مثال: شارع التحرير"
                required
              />
            </div>

            {/* Building, Floor, Apartment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="buildingNumber">رقم المبنى / العمارة</Label>
                <Input
                  id="buildingNumber"
                  value={address.buildingNumber || ''}
                  onChange={(e) => handleChange('buildingNumber', e.target.value)}
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="floorNumber">رقم الطابق</Label>
                <Input
                  id="floorNumber"
                  value={address.floorNumber || ''}
                  onChange={(e) => handleChange('floorNumber', e.target.value)}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="apartmentNumber">رقم الشقة</Label>
                <Input
                  id="apartmentNumber"
                  value={address.apartmentNumber || ''}
                  onChange={(e) => handleChange('apartmentNumber', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Landmark & Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="landmark">أقرب معلم</Label>
                <Input
                  id="landmark"
                  value={address.landmark || ''}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  placeholder="مثال: بجوار مسجد الفتح"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">الرمز البريدي</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="11111"
                />
              </div>
            </div>

            {/* Full Address (Auto-generated or manual) */}
            <div>
              <Label htmlFor="address">العنوان الكامل</Label>
              <Textarea
                id="address"
                value={address.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="العنوان الكامل بالتفصيل"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                أو اترك الحقل فارغاً ليتم توليده تلقائياً من البيانات أعلاه
              </p>
            </div>

            {/* Pickup Instructions */}
            <div>
              <Label htmlFor="pickupInstructions">تعليمات استلام الشحنات</Label>
              <Textarea
                id="pickupInstructions"
                value={address.pickupInstructions || ''}
                onChange={(e) => handleChange('pickupInstructions', e.target.value)}
                placeholder="مثال: الاستلام من الساعة 10 صباحاً حتى 5 مساءً - يرجى الاتصال قبل الوصول"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-w-[120px]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    حفظ العنوان
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
