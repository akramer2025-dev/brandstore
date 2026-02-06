'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    name: '',
    description: '',
    image: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('تم إضافة الصنف بنجاح!');
        router.push('/vendor/categories');
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ أثناء إضافة الصنف');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة الصنف');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallbackUrl="/vendor/dashboard" />
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">إضافة صنف جديد</h1>
              <p className="text-gray-300">أضف صنف جديد للمنتجات</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" />
                معلومات الصنف
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameAr" className="text-white">اسم الصنف بالعربي *</Label>
                  <Input
                    id="nameAr"
                    name="nameAr"
                    required
                    value={formData.nameAr}
                    onChange={handleChange}
                    placeholder="مثال: قمصان"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-white">اسم الصنف بالإنجليزي</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Shirts"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">الوصف</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="وصف الصنف..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-white">رابط الصورة</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الصنف'
              )}
            </Button>
            
            <Link href="/vendor/dashboard">
              <Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
