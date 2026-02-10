'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Upload, X, Loader2, Calculator, Store, Wallet, Phone, User, Camera, Sparkles, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SmartCamera } from '@/components/SmartCamera';
import { BackButton } from '@/components/BackButton';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSmartCamera, setShowSmartCamera] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
    purchasePrice: '', // سعر الشراء
    // حقول جديدة لنوع المنتج ومعلومات المورد
    productSource: 'OWNED' as 'OWNED' | 'CONSIGNMENT', // مملوك أو وسيط
    supplierName: '', // اسم المورد
    supplierPhone: '', // رقم المورد
    supplierCost: '', // تكلفة المورد (السعر اللي هتدفعه للمورد)
    supplierNotes: '', // ملاحظات
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
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data || []))
      .catch(err => console.error('Error fetching categories:', err));

    // استرجاع المسودة من localStorage
    const savedDraft = localStorage.getItem('newProductDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData);
        setImages(draft.images || []);
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    }
  }, []);

  // Auto-save كمسودة كل 30 ثانية
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.nameAr || images.length > 0) {
        setAutoSaving(true);
        try {
          localStorage.setItem('newProductDraft', JSON.stringify({
            formData,
            images,
            savedAt: new Date().toISOString()
          }));
          setLastSaved(new Date());
        } catch (err) {
          console.error('Error saving draft:', err);
        } finally {
          setTimeout(() => setAutoSaving(false), 1000);
        }
      }
    }, 30000); // كل 30 ثانية

    return () => clearInterval(autoSaveInterval);
  }, [formData, images]);

  // معالجة الكاميرا الذكية
  const handleSmartCameraScan = useCallback((data: any, imageUrl: string) => {
    // ملء البيانات تلقائياً
    setFormData(prev => ({
      ...prev,
      nameAr: data.nameAr || prev.nameAr,
      name: data.name || prev.name,
      descriptionAr: data.descriptionAr || prev.descriptionAr,
      description: data.description || prev.description,
      price: data.suggestedPrice?.toString() || prev.price,
      sizes: data.sizes || prev.sizes,
      colors: data.colors || prev.colors,
    }));

    // إضافة الصورة
    if (imageUrl && !images.includes(imageUrl)) {
      setImages(prev => [...prev, imageUrl]);
    }

    // إخفاء الكاميرا
    setShowSmartCamera(false);
  }, [images]);

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await uploadImages(files);
    }
  }, []);

  // رفع الصور مع شريط التقدم
  const uploadImages = async (files: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 4 * 1024 * 1024; // 4 MB (Vercel limit is 4.5 MB)

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`❌ نوع الملف غير مسموح: ${file.name}\n✅ الأنواع المسموحة: JPG, PNG, WEBP`);
        return;
      }
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`❌ حجم الصورة كبير جداً: ${file.name}\n📊 الحجم: ${fileSizeMB} MB\n✅ الحد الأقصى: 4 MB\n\n💡 نصيحة: ضغط الصورة قبل الرفع`);
        return;
      }
    }

    setUploadingImages(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setImages(prev => [...prev, ...data.urls]);
        } else if (xhr.status === 413) {
          alert('❌ الصورة كبيرة جداً!\n✅ الحد الأقصى: 4 MB\n💡 استخدم أداة ضغط الصور أولاً');
        } else {
          alert('❌ فشل رفع الصور');
        }
        setUploadingImages(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        alert('❌ حدث خطأ أثناء رفع الصور');
        setUploadingImages(false);
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('❌ حدث خطأ أثناء رفع الصور');
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  // رفع الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadImages(Array.from(files));
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
          productionCost: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          supplierCost: formData.supplierCost ? parseFloat(formData.supplierCost) : null,
          images: images.join(','),
          sizes: formData.sizes.join(','),
          colors: formData.colors.join(','),
          platformCommission: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const message = data.deducted > 0 
          ? `✅ ${data.message}\n\n💰 تم خصم ${data.deducted.toLocaleString()} ج من رأس المال`
          : '✅ تم إضافة المنتج بنجاح!';
        
        // حذف المسودة
        localStorage.removeItem('newProductDraft');
        
        alert(message);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <BackButton fallbackUrl="/vendor/products" />
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Package className="h-8 w-8 text-purple-400" />
                إضافة منتج جديد
              </h1>
              <p className="text-gray-400 mt-1">املأ البيانات لإضافة منتج جديد</p>
            </div>
          </div>
          {/* Auto-save indicator */}
          {(autoSaving || lastSaved) && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              {autoSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span className="text-green-400">✓</span>
                  <span>تم الحفظ {lastSaved && new Date(lastSaved).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* قسم الكاميرا الذكية */}
          {showSmartCamera && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6 animate-in fade-in slide-in-from-top duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-400 animate-pulse" />
                  📸 الكاميرا الذكية - تعرف تلقائي على المنتج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SmartCamera 
                  onProductScanned={handleSmartCameraScan}
                  onImageCaptured={(url) => {
                    if (!images.includes(url)) {
                      setImages(prev => [...prev, url]);
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-400" />
                  صور المنتج
                </div>
                {/* زر الكاميرا الذكية مخفي مؤقتاً */}
                {false && (
                  <Button
                    type="button"
                    onClick={() => setShowSmartCamera(!showSmartCamera)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {showSmartCamera ? 'إخفاء الكاميرا' : '📸 كاميرا ذكية'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* عرض الصور */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  {images.map((image, index) => (
                    <div key={index} className="relative group animate-in zoom-in duration-200">
                      <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden ring-2 ring-purple-500/30 group-hover:ring-purple-500 transition-all">
                        <Image
                          src={image}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                          ⭐ الرئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* منطقة Drag & Drop */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-purple-400 bg-purple-500/20 scale-105'
                    : 'border-white/20 hover:border-purple-400'
                }`}
              >
                {uploadingImages ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 mx-auto text-purple-400 animate-spin" />
                    <p className="text-white font-bold">جاري رفع الصور...</p>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">{Math.round(uploadProgress)}%</p>
                  </div>
                ) : isDragging ? (
                  <>
                    <ImagePlus className="h-16 w-16 mx-auto text-purple-400 mb-4 animate-bounce" />
                    <p className="text-purple-300 font-bold text-lg">أفلت الصور هنا! 🎉</p>
                  </>
                ) : (
                  <>
                    <Label htmlFor="images" className="cursor-pointer block">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4 group-hover:text-purple-400 transition-colors" />
                      <p className="text-white mb-2 font-bold">
                        اضغط لرفع الصور أو اسحبها هنا
                      </p>
                      <p className="text-gray-400 text-sm mb-1">يمكنك رفع عدة صور (PNG, JPG, WebP)</p>
                      <p className="text-yellow-400 text-xs">📏 الحد الأقصى: 5 ميجابايت لكل صورة</p>
                    </Label>
                  </>
                )}
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* نصائح */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <strong>نصيحة:</strong> استخدم الكاميرا الذكية للتعرف التلقائي على المنتج واستخراج البيانات من الصورة!
                </p>
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

              {/* الفئة */}
              <div>
                <Label htmlFor="category" className="text-white text-lg font-semibold flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-purple-400" />
                  <span>الفئة *</span>
                  <span className="text-sm text-gray-400 font-normal">(اختر الفئة المناسبة للمنتج)</span>
                </Label>
                <select
                  id="category"
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/5 text-white text-lg font-medium hover:border-purple-400/50 transition-all"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="" disabled className="bg-gray-800">اختر الفئة المناسبة...</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id} className="bg-gray-800 py-2">
                      {category.nameAr} ({category.name})
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
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-white/5 border-white/20 text-white hover:border-purple-400'
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
                          ? 'border-purple-500 ring-2 ring-purple-500'
                          : 'border-white/20 hover:border-purple-400'
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
                        ? 'bg-purple-500 border-purple-500 text-white'
                        : 'bg-white/5 border-white/20 text-white hover:border-purple-400'
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
                        ? 'bg-purple-500 border-purple-500 text-white'
                        : 'bg-white/5 border-white/20 text-white hover:border-purple-400'
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

              {/* سعر الشراء */}
              <div>
                <Label htmlFor="purchasePrice" className="text-white flex items-center gap-2">
                  💰 سعر الشراء <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="50.00"
                  required
                />
                <div className="mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-xs text-amber-300">
                    ⚠️ <strong>مهم:</strong> سعر الشراء × الكمية = سيتم خصمه من رأس المال ({formData.purchasePrice && formData.stock ? `${(parseFloat(formData.purchasePrice) * parseInt(formData.stock)).toLocaleString()} ج` : '---'})
                  </p>
                </div>
                
                {/* عرض الربح المتوقع */}
                {formData.price && formData.purchasePrice && (
                  <div className="mt-3 p-3 rounded-lg bg-white/10 border border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">💵 الربح المتوقع:</span>
                      <span className={`font-bold text-lg ${
                        parseFloat(formData.price) - parseFloat(formData.purchasePrice) > 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {(parseFloat(formData.price) - parseFloat(formData.purchasePrice)).toFixed(2)} ج
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400 text-sm">نسبة الربح:</span>
                      <span className="text-purple-400 font-medium">
                        {formData.purchasePrice && parseFloat(formData.purchasePrice) > 0
                          ? ((parseFloat(formData.price) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* قسم نوع المنتج - جديد */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-yellow-400" />
                مصدر المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* اختيار نوع المنتج */}
              <div>
                <Label className="text-white mb-3 block">هل هذا المنتج من مخزونك أم من محل آخر؟</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productSource: 'OWNED', supplierName: '', supplierPhone: '', supplierCost: '', supplierNotes: '' })}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      formData.productSource === 'OWNED'
                        ? 'bg-gradient-to-br from-emerald-500/30 to-purple-500/30 border-emerald-400 ring-2 ring-emerald-400/50'
                        : 'bg-white/5 border-white/20 text-white hover:border-emerald-400/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                        formData.productSource === 'OWNED' 
                          ? 'bg-gradient-to-br from-emerald-400 to-purple-500' 
                          : 'bg-white/10'
                      }`}>
                        <Wallet className="h-7 w-7 text-white" />
                      </div>
                      <p className={`font-bold text-lg ${formData.productSource === 'OWNED' ? 'text-emerald-300' : 'text-white'}`}>
                        💰 منتج مملوك
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        اشتريته من رأس مالك وموجود في مخزونك
                      </p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, productSource: 'CONSIGNMENT' })}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      formData.productSource === 'CONSIGNMENT'
                        ? 'bg-gradient-to-br from-pink-500/30 to-rose-500/30 border-pink-400 ring-2 ring-pink-400/50'
                        : 'bg-white/5 border-white/20 text-white hover:border-pink-400/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                        formData.productSource === 'CONSIGNMENT' 
                          ? 'bg-gradient-to-br from-pink-400 to-rose-500' 
                          : 'bg-white/10'
                      }`}>
                        <Store className="h-7 w-7 text-white" />
                      </div>
                      <p className={`font-bold text-lg ${formData.productSource === 'CONSIGNMENT' ? 'text-pink-300' : 'text-white'}`}>
                        🏪 منتج وسيط (من محل آخر)
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        من محل تاني وهتدفع للمورد بعد البيع
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* معلومات المورد - تظهر فقط للمنتجات الوسيط */}
              {formData.productSource === 'CONSIGNMENT' && (
                <div className="mt-6 p-5 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-5 h-5 text-pink-400" />
                    <h4 className="text-pink-300 font-bold">معلومات المورد / المحل</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplierName" className="text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-pink-400" />
                        اسم المورد / المحل *
                      </Label>
                      <Input
                        id="supplierName"
                        required={formData.productSource === 'CONSIGNMENT'}
                        value={formData.supplierName}
                        onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                        className="bg-white/10 border-pink-400/30 text-white"
                        placeholder="مثال: محل الأناقة"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplierPhone" className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-pink-400" />
                        رقم الهاتف
                      </Label>
                      <Input
                        id="supplierPhone"
                        value={formData.supplierPhone}
                        onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                        className="bg-white/10 border-pink-400/30 text-white"
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="supplierCost" className="text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-pink-400" />
                      سعر المورد (اللي هتدفعه له) *
                    </Label>
                    <Input
                      id="supplierCost"
                      type="number"
                      step="0.01"
                      required={formData.productSource === 'CONSIGNMENT'}
                      value={formData.supplierCost}
                      onChange={(e) => setFormData({ ...formData, supplierCost: e.target.value })}
                      className="bg-white/10 border-pink-400/30 text-white text-lg"
                      placeholder="100.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplierNotes" className="text-white">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="supplierNotes"
                      value={formData.supplierNotes}
                      onChange={(e) => setFormData({ ...formData, supplierNotes: e.target.value })}
                      className="bg-white/10 border-pink-400/30 text-white"
                      placeholder="أي ملاحظات عن المورد أو المنتج..."
                      rows={2}
                    />
                  </div>

                  {/* حاسبة الربح */}
                  {formData.price && formData.supplierCost && (
                    <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 border border-emerald-400/30 rounded-lg">
                      <p className="text-emerald-300 font-bold mb-2">💵 حساب الربح:</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-gray-400 text-sm">سعر البيع</p>
                          <p className="text-white font-bold text-xl">{parseFloat(formData.price).toLocaleString()} ج</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">تكلفة المورد</p>
                          <p className="text-red-400 font-bold text-xl">-{parseFloat(formData.supplierCost).toLocaleString()} ج</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">ربحك</p>
                          <p className="text-emerald-400 font-bold text-xl">
                            {(parseFloat(formData.price) - parseFloat(formData.supplierCost)).toLocaleString()} ج
                          </p>
                        </div>
                      </div>
                      <p className="text-yellow-300 text-sm mt-3 text-center">
                        ⚠️ عند البيع: سيتم تسجيل {parseFloat(formData.supplierCost).toLocaleString()} ج كمستحق للمورد
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">إعدادات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* خيار الظهور في المتجر */}
              <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-5 h-5 accent-purple-500"
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
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
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
