'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Save, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditDeliveryZonePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    governorate: '',
    deliveryFee: '',
    minOrderValue: '0',
    isActive: true
  });

  useEffect(() => {
    fetchZone();
  }, [params.id]);

  const fetchZone = async () => {
    try {
      const res = await fetch(`/api/admin/delivery-zones/${params.id}`);
      if (!res.ok) throw new Error('فشل في جلب البيانات');
      
      const zone = await res.json();
      setFormData({
        governorate: zone.governorate,
        deliveryFee: zone.deliveryFee.toString(),
        minOrderValue: zone.minOrderValue.toString(),
        isActive: zone.isActive
      });
    } catch (error: any) {
      toast.error(error.message);
      router.push('/admin/delivery-zones');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/delivery-zones/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governorate: formData.governorate,
          deliveryFee: parseFloat(formData.deliveryFee),
          minOrderValue: parseFloat(formData.minOrderValue),
          isActive: formData.isActive
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'فشل تحديث المنطقة');
      }

      toast.success('تم تحديث منطقة التوصيل بنجاح');
      router.push('/admin/delivery-zones');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/delivery-zones"
            className="inline-flex items-center text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة إلى القائمة
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-purple-400" />
            تعديل منطقة التوصيل
          </h1>
          <p className="text-white/60 mt-2">
            عدل بيانات المنطقة ورسوم التوصيل
          </p>
        </div>

        {/* Form */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">بيانات المنطقة</CardTitle>
            <CardDescription className="text-white/60">
              املأ جميع الحقول المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Governorate */}
              <div className="space-y-2">
                <Label htmlFor="governorate" className="text-white">
                  اسم المحافظة <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="governorate"
                  value={formData.governorate}
                  onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  placeholder="مثال: القاهرة"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Delivery Fee */}
              <div className="space-y-2">
                <Label htmlFor="deliveryFee" className="text-white">
                  رسوم التوصيل (ج.م) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                  placeholder="125"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Min Order Value */}
              <div className="space-y-2">
                <Label htmlFor="minOrderValue" className="text-white">
                  الحد الأدنى للطلب (ج.م)
                </Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/40">
                  اتركه 0 إذا لم يكن هناك حد أدنى
                </p>
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="space-y-1">
                  <Label htmlFor="isActive" className="text-white">
                    تفعيل المنطقة
                  </Label>
                  <p className="text-xs text-white/40">
                    المناطق النشطة فقط تظهر للعملاء
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Save className="w-5 h-5 ml-2" />
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
                <Link href="/admin/delivery-zones" className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
