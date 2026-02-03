'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    descriptionAr: '',
    price: '',
    originalPrice: '',
    purchasePrice: '',
    stock: '',
    isVisible: true,
  });

  // جلب بيانات المنتج
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/vendor/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          const product = data.product;
          setFormData({
            nameAr: product.nameAr || '',
            descriptionAr: product.descriptionAr || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            purchasePrice: product.productionCost?.toString() || '',
            stock: product.stock?.toString() || '',
            isVisible: product.isVisible ?? true,
          });
        } else {
          alert('المنتج غير موجود');
          router.push('/vendor/products');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // حفظ التعديلات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: formData.nameAr,
          name: formData.nameAr,
          descriptionAr: formData.descriptionAr,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          productionCost: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          stock: parseInt(formData.stock),
          isVisible: formData.isVisible,
        }),
      });

      if (response.ok) {
        alert('✅ تم تحديث المنتج بنجاح!');
        router.push('/vendor/products');
      } else {
        const error = await response.json();
        alert(`❌ ${error.error || 'فشل تحديث المنتج'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // حساب الربح المتوقع
  const expectedProfit = formData.price && formData.purchasePrice 
    ? parseFloat(formData.price) - parseFloat(formData.purchasePrice)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/products">
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-purple-400" />
              تعديل المنتج
            </h1>
            <p className="text-gray-400 mt-1">تعديل بيانات المنتج</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">بيانات المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* اسم المنتج */}
              <div>
                <Label htmlFor="nameAr" className="text-white">اسم المنتج *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>

              {/* الوصف */}
              <div>
                <Label htmlFor="descriptionAr" className="text-white">الوصف</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>

              {/* الأسعار */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice" className="text-white">💰 سعر الشراء *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-white">💵 سعر البيع *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
              </div>

              {/* الربح المتوقع */}
              {formData.price && formData.purchasePrice && (
                <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">💰 الربح المتوقع:</span>
                    <span className={`font-bold text-xl ${expectedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {expectedProfit.toFixed(2)} ج
                    </span>
                  </div>
                </div>
              )}

              {/* السعر الأصلي والكمية */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice" className="text-white">السعر قبل الخصم (اختياري)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="text-white">الكمية *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
              </div>

              {/* الظهور */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <Label htmlFor="isVisible" className="text-white cursor-pointer">
                  إظهار المنتج في المتجر
                </Label>
              </div>

              {/* زر الحفظ */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    حفظ التعديلات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
