'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nameAr: '',
    descriptionAr: '',
    price: '',
    originalPrice: '',
    purchasePrice: '',
    stock: '',
    categoryId: '',
    isVisible: true,
  });

  // جلب الفئات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
            categoryId: product.categoryId || '',
            isVisible: product.isVisible ?? true,
          });
          
          // إصلاح: تحويل الصور من string إلى array
          if (product.images) {
            if (typeof product.images === 'string') {
              // إذا كانت string مفصولة بفواصل
              setImages(product.images.split(',').filter((img: string) => img.trim()));
            } else if (Array.isArray(product.images)) {
              // إذا كانت array بالفعل
              setImages(product.images);
            } else {
              setImages([]);
            }
          } else {
            setImages([]);
          }
        } else {
          alert('المنتج غير موجود');
          router.push('/vendor/inventory');
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

  // رفع الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // التحقق من نوع وحجم الملفات قبل الرفع
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // التحقق من النوع
      if (!allowedTypes.includes(file.type)) {
        alert(`❌ نوع الملف غير مسموح: ${file.name}\n\nيُسمح فقط بـ: JPEG, PNG, WebP`);
        return;
      }

      // التحقق من الحجم
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        alert(`❌ حجم الملف كبير جداً: ${file.name}\n\nالحجم: ${sizeMB} MB\nالحد الأقصى: 5 MB`);
        return;
      }
    }

    setUploadingImages(true);
    const formDataUpload = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formDataUpload.append('files', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok) {
        setImages([...images, ...data.urls]);
      } else {
        // عرض رسالة خطأ واضحة من الـ API
        const errorMessage = data.error || 'فشل رفع الصور';
        const suggestion = data.suggestion || '';
        alert(`❌ ${errorMessage}\n\n${suggestion}`);
        console.error('Upload error:', data);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('❌ حدث خطأ أثناء رفع الصور\n\nتأكد من الاتصال بالإنترنت وحجم الصور (أقل من 5 ميجابايت)');
    } finally {
      setUploadingImages(false);
    }
  };

  // حذف صورة
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // حفظ التعديلات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('يجب إضافة صورة واحدة على الأقل');
      return;
    }
    
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
          categoryId: formData.categoryId || null,
          images: images.join(','), // تحويل array إلى string مفصول بفواصل
          isVisible: formData.isVisible,
        }),
      });

      if (response.ok) {
        alert('✅ تم تحديث المنتج بنجاح!');
        router.push('/vendor/inventory');
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
          <Link href="/vendor/inventory">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* صور المنتج */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">📸 صور المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* معاينة الصور */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/20 group">
                      <Image
                        src={img}
                        alt={`صورة ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-purple-500/90 text-white text-xs px-2 py-1 rounded">
                          الصورة الرئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* زر رفع صور */}
              <div>
                <Label htmlFor="images" className="cursor-pointer">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10">
                    {uploadingImages ? (
                      <Loader2 className="w-8 h-8 mx-auto text-purple-400 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                    )}
                    <p className="text-white mb-1">اضغط لإضافة المزيد من الصور</p>
                    <p className="text-sm text-gray-400 mb-1">PNG, JPG, WebP</p>
                    <p className="text-yellow-400 text-xs">الحد الأقصى: 5 ميجابايت لكل صورة</p>
                  </div>
                </Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </div>
            </CardContent>
          </Card>

          {/* بيانات المنتج */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">📝 البيانات الأساسية</CardTitle>
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

              {/* الفئة */}
              <div>
                <Label htmlFor="categoryId" className="text-white text-lg font-semibold flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-purple-400" />
                  <span>الفئة *</span>
                  <span className="text-sm text-gray-400 font-normal">(اختر الفئة المناسبة للمنتج)</span>
                </Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/5 text-white text-lg font-medium hover:border-purple-400/50 transition-all"
                  required
                >
                  <option value="" disabled className="bg-gray-800">اختر الفئة المناسبة...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-gray-800 py-2">
                      {cat.nameAr} ({cat.name})
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-amber-400 mt-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>لا توجد فئات متاحة. يرجى التواصل مع الإدارة لإضافة فئات.</span>
                  </p>
                )}
                {formData.categoryId && (
                  <p className="text-sm text-green-400 mt-2 flex items-center gap-2">
                    <span>✓</span>
                    <span>تم اختيار الفئة بنجاح</span>
                  </p>
                )}
              </div>

              {/* الأسعار */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">💰 الربح المتوقع:</span>
                    <span className={`font-bold text-xl ${expectedProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {expectedProfit.toFixed(2)} ج
                    </span>
                  </div>
                </div>
              )}

              {/* السعر الأصلي والكمية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="stock" className="text-white">📦 الكمية *</Label>
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
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/20">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <Label htmlFor="isVisible" className="text-white cursor-pointer">
                  👁️ إظهار المنتج في المتجر
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* زر الحفظ */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-14 text-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  حفظ التعديلات
                </>
              )}
            </Button>
            <Link href="/vendor/inventory" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-14 text-lg"
              >
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
