'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Upload, X, Loader2, Calculator } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: '',
    originalPrice: '',
    stock: '',
    categoryId: '',
    isVisible: true,
    sizes: [] as string[], // المقاسات المختارة
    colors: [] as string[], // الألوان المختارة
    saleType: 'SINGLE', // نوع البيع: SINGLE أو BUNDLE
    productionCost: '', // تكلفة الإنتاج
  });

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableColors = [
    { name: 'أحمر', value: 'red', hex: '#EF4444' },
    { name: 'أزرق', value: 'blue', hex: '#3B82F6' },
    { name: 'أخضر', value: 'green', hex: '#10B981' },
    { name: 'أصفر', value: 'yellow', hex: '#F59E0B' },
    { name: 'أسود', value: 'black', hex: '#000000' },
    { name: 'أبيض', value: 'white', hex: '#FFFFFF' },
    { name: 'رمادي', value: 'gray', hex: '#6B7280' },
    { name: 'بني', value: 'brown', hex: '#92400E' },
    { name: 'وردي', value: 'pink', hex: '#EC4899' },
    { name: 'بنفسجي', value: 'purple', hex: '#8B5CF6' },
  ];

  // جلب الأصناف
  useState(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  });

  // رفع الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImages([...images, ...data.urls]);
      } else {
        alert('فشل رفع الصور');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploadingImages(false);
    }
  };

  // حذف صورة
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // حفظ المنتج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('يرجى إضافة صورة واحدة على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          stock: parseInt(formData.stock),
          productionCost: formData.productionCost ? parseFloat(formData.productionCost) : null,
          images: images.join(','),
          sizes: formData.sizes.join(','), // تحويل المصفوفة لنص مفصول بفواصل
          colors: formData.colors.join(','), // تحويل المصفوفة لنص مفصول بفواصل
          platformCommission: 5, // عمولة المتجر 5%
        }),
      });

      if (response.ok) {
        alert('✅ تم إضافة المنتج بنجاح!');
        router.push('/vendor/products');
      } else {
        const error = await response.json();
        alert(error.error || 'فشل إضافة المنتج');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/products">
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-teal-400" />
              إضافة منتج جديد
            </h1>
            <p className="text-gray-400 mt-1">املأ البيانات لإضافة منتج جديد</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-teal-400" />
                صور المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* عرض الصور */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                          الصورة الرئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* زر رفع الصور */}
              <div>
                <Label htmlFor="images" className="cursor-pointer">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
                    {uploadingImages ? (
                      <Loader2 className="h-12 w-12 mx-auto text-teal-400 animate-spin mb-4" />
                    ) : (
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    )}
                    <p className="text-white mb-2">
                      {uploadingImages ? 'جاري رفع الصور...' : 'اضغط لرفع الصور'}
                    </p>
                    <p className="text-gray-400 text-sm">يمكنك رفع عدة صور (PNG, JPG)</p>
                  </div>
                </Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">معلومات المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameAr" className="text-white">الاسم بالعربي *</Label>
                  <Input
                    id="nameAr"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: تيشيرت قطن"
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-white">الاسم بالإنجليزي</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Cotton T-Shirt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descriptionAr" className="text-white">الوصف بالعربي</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="وصف المنتج..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">الوصف بالإنجليزي</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-white">السعر *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice" className="text-white">السعر الأصلي (اختياري)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="text-white">الكمية المتاحة *</Label>
                  <Input
                    id="stock"
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoryId" className="text-white">الصنف *</Label>
                <select
                  id="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-md p-2"
                >
                  <option value="">اختر الصنف</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>
              </div>

              {/* المقاسات */}
              <div>
                <Label className="text-white mb-2 block">المقاسات المتاحة</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (formData.sizes.includes(size)) {
                          setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
                        } else {
                          setFormData({ ...formData, sizes: [...formData.sizes, size] });
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.sizes.includes(size)
                          ? 'bg-teal-500 border-teal-500 text-white'
                          : 'bg-white/5 border-white/20 text-white hover:border-teal-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* الألوان */}
              <div>
                <Label className="text-white mb-2 block">الألوان المتاحة</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        if (formData.colors.includes(color.name)) {
                          setFormData({ ...formData, colors: formData.colors.filter(c => c !== color.name) });
                        } else {
                          setFormData({ ...formData, colors: [...formData.colors, color.name] });
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.colors.includes(color.name)
                          ? 'border-teal-500 ring-2 ring-teal-500'
                          : 'border-white/20 hover:border-teal-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {formData.colors.includes(color.name) && (
                        <div className="text-white font-bold text-center">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* نوع البيع */}
              <div>
                <Label className="text-white mb-2 block">نوع البيع</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, saleType: 'SINGLE' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.saleType === 'SINGLE'
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'bg-white/5 border-white/20 text-white hover:border-teal-400'
                    }`}
                  >
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-bold">قطعة واحدة</p>
                      <p className="text-xs mt-1">بيع المنتج منفرداً</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, saleType: 'BUNDLE' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.saleType === 'BUNDLE'
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'bg-white/5 border-white/20 text-white hover:border-teal-400'
                    }`}
                  >
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-bold">عرض (مع منتجات أخرى)</p>
                      <p className="text-xs mt-1">بيع مجموعة منتجات</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* تكلفة الإنتاج */}
              <div>
                <Label htmlFor="productionCost" className="text-white">تكلفة الإنتاج (اختياري)</Label>
                <Input
                  id="productionCost"
                  type="number"
                  step="0.01"
                  value={formData.productionCost}
                  onChange={(e) => setFormData({ ...formData, productionCost: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="50.00"
                />
                <p className="text-xs text-gray-400 mt-1">تستخدم لحساب الأرباح</p>
              </div>

              {/* خيار الظهور في المتجر */}
              <div className="flex items-center gap-3 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-5 h-5 accent-teal-500"
                />
                <Label htmlFor="isVisible" className="text-white cursor-pointer">
                  يظهر في المتجر (العملاء يمكنهم رؤيته وشراؤه)
                </Label>
              </div>

              {/* معلومات العمولة */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calculator className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-bold">💡 ملاحظة هامة</p>
                    <p className="text-yellow-100 text-sm mt-1">
                      عمولة المتجر <span className="font-bold">5%</span> من قيمة كل منتج يتم بيعه عبر التطبيق
                    </p>
                    {formData.price && (
                      <p className="text-yellow-100 text-sm mt-1">
                        مثال: إذا كان سعر المنتج {formData.price} جنيه، ستحصل على{' '}
                        <span className="font-bold">
                          {(parseFloat(formData.price) * 0.95).toFixed(2)} جنيه
                        </span>{' '}
                        (بعد خصم 5% عمولة = {(parseFloat(formData.price) * 0.05).toFixed(2)} جنيه)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || images.length === 0}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  حفظ المنتج
                </>
              )}
            </Button>
            <Link href="/vendor/products">
              <Button type="button" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
