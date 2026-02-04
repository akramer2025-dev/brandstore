'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DeliveryZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/admin/delivery-zones');
      if (response.ok) {
        const data = await response.json();
        setZones(data);
      }
    } catch (error) {
      toast.error('فشل في جلب المناطق');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (zoneId: string) => {
    setToggling(zoneId);
    try {
      const response = await fetch(`/api/admin/delivery-zones/${zoneId}/toggle`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('فشل في تحديث الحالة');
      
      toast.success('تم تحديث حالة المنطقة بنجاح');
      fetchZones();
    } catch (error) {
      toast.error('حدث خطأ في تحديث الحالة');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-400" />
              إدارة مناطق التوصيل
            </h1>
            <p className="text-white/60 mt-2">
              إضافة وتعديل رسوم التوصيل للمحافظات
            </p>
          </div>
          <Link href="/admin/delivery-zones/new">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <PlusCircle className="w-5 h-5 ml-2" />
              إضافة محافظة جديدة
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">إجمالي المحافظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">{zones.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-400">
                {zones.filter(z => z.isActive).length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">متوسط رسوم التوصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400">
                {zones.length > 0 
                  ? Math.round(zones.reduce((sum, z) => sum + z.deliveryFee, 0) / zones.length)
                  : 0
                } ج.م
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Zones List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <Card 
              key={zone.id}
              className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    {zone.governorate}
                  </CardTitle>
                  {zone.isActive ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      نشط
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      غير نشط
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">رسوم التوصيل:</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {zone.deliveryFee} ج.م
                  </span>
                </div>
                
                {zone.minOrderValue > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">الحد الأدنى للطلب:</span>
                    <span className="text-white font-semibold">
                      {zone.minOrderValue} ج.م
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Link href={`/admin/delivery-zones/${zone.id}/edit`} className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  </Link>
                  
                  <Button 
                    onClick={() => handleToggle(zone.id)}
                    disabled={toggling === zone.id}
                    variant="outline" 
                    className={`w-full ${
                      zone.isActive 
                        ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
                        : 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {toggling === zone.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      zone.isActive ? 'إيقاف' : 'تفعيل'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {zones.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-4">
                لا توجد مناطق توصيل مضافة بعد
              </p>
              <Link href="/admin/delivery-zones/new">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <PlusCircle className="w-5 h-5 ml-2" />
                  إضافة منطقة التوصيل الأولى
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
