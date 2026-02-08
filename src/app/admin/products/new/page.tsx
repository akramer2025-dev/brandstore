"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Camera, Upload, X, ImagePlus, Sparkles } from "lucide-react";
import Link from "next/link";
import { SmartCamera } from "@/components/SmartCamera";
import { toast } from "sonner";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";

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
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    originalPrice: "",
    stock: "",
    categoryId: "",
    sku: "",
    sizes: [] as string[],
    colors: [] as string[],
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

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));

    // استرجاع المسودة
    const savedDraft = localStorage.getItem('adminNewProductDraft');
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

  // Auto-save
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.name || formData.nameAr || images.length > 0) {
        setAutoSaving(true);
        try {
          localStorage.setItem('adminNewProductDraft', JSON.stringify({
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
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData, images]);

  // Smart Camera Handler
  const handleSmartCameraScan = useCallback((data: any, imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      nameAr: data.nameAr || prev.nameAr,
      name: data.name || prev.name,
      descriptionAr: data.descriptionAr || prev.descriptionAr,
      description: data.description || prev.description,
      price: data.suggestedPrice?.toString() || prev.price,
    }));

    if (imageUrl && !images.includes(imageUrl)) {
      setImages(prev => [...prev, imageUrl]);
    }

    setShowSmartCamera(false);
  }, [images]);

  // Drag & Drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await uploadImages(files);
    }
  }, []);

  // Upload Images with Progress
  const uploadImages = async (files: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`نوع الملف غير مسموح: ${file.name}`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`حجم الملف كبير جداً: ${file.name}`);
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
          setUploadProgress((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setImages(prev => [...prev, ...data.urls]);
          toast.success('تم رفع الصور بنجاح!');
        } else {
          toast.error('فشل رفع الصور');
        }
        setUploadingImages(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        toast.error('حدث خطأ أثناء رفع الصور');
        setUploadingImages(false);
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('حدث خطأ أثناء رفع الصور');
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadImages(Array.from(files));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('يرجى إضافة صورة واحدة على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          stock: parseInt(formData.stock),
          images: images.join(','),
          sizes: formData.sizes.join(','),
          colors: formData.colors.join(','),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل إضافة المنتج");
      }

      localStorage.removeItem('adminNewProductDraft');
      toast.success("تم إضافة المنتج بنجاح");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "فشل إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <BackButton fallbackUrl="/admin/products" label="العودة للمنتجات" className="mb-2" />
              <h1 className="text-4xl font-bold drop-shadow-lg">إضافة منتج جديد</h1>
              <p className="text-teal-100 mt-2">املأ البيانات لإضافة منتج جديد للمتجر</p>
            </div>
            
            {/* Auto-save indicator */}
            {(autoSaving || lastSaved) && (
              <div className="text-sm text-teal-100 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                {autoSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-300">✓</span>
                    <span>تم الحفظ {lastSaved && new Date(lastSaved).toLocaleTimeString('ar-EG')}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Smart Camera Section */}
            {showSmartCamera && (
              <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Camera className="w-5 h-5 animate-pulse" />
                    📸 الكاميرا الذكية - تعرف تلقائي
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

            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>بيانات المنتج</span>
                {/* زر الكاميرا الذكية مخفي مؤقتاً */}
                {false && (
                  <Button
                    type="button"
                    onClick={() => setShowSmartCamera(!showSmartCamera)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {showSmartCamera ? 'إخفاء الكاميرا' : '📸 كاميرا ذكية'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Images Section */}
              <div className="space-y-4">
                <Label>صور المنتج *</Label>

                {/* Display Images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden ring-2 ring-teal-500/30 group-hover:ring-teal-500">
                          <Image
                            src={image}
                            alt={`Product ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                            ⭐ رئيسية
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging
                      ? 'border-teal-500 bg-teal-50 scale-105'
                      : 'border-gray-300 hover:border-teal-400'
                  }`}
                >
                  {uploadingImages ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 mx-auto text-teal-500 animate-spin" />
                      <p className="font-bold">جاري رفع الصور...</p>
                      {uploadProgress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-gray-600 text-sm">{Math.round(uploadProgress)}%</p>
                    </div>
                  ) : isDragging ? (
                    <>
                      <ImagePlus className="w-16 h-16 mx-auto text-teal-500 animate-bounce mb-4" />
                      <p className="text-teal-700 font-bold text-lg">أفلت الصور هنا! 🎉</p>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="images" className="cursor-pointer block">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4 hover:text-teal-500 transition-colors" />
                        <p className="font-bold mb-2">اضغط لرفع الصور أو اسحبها هنا</p>
                        <p className="text-gray-500 text-sm">PNG, JPG, WebP - حتى 5 ميجابايت</p>
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-700 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <strong>نصيحة:</strong> استخدم الكاميرا الذكية للتعرف التلقائي!
                  </p>
                </div>
              </div>

              {/* Rest of form fields remain the same ... */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">اسم المنتج (عربي) *</Label>
                  <Input
                    id="nameAr"
                    placeholder="مثال: قميص قطن رجالي"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج (إنجليزي)</Label>
                  <Input
                    id="name"
                    placeholder="Cotton Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                <Input
                  id="sku"
                  placeholder="SH-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">الوصف (عربي) *</Label>
                  <Textarea
                    id="descriptionAr"
                    placeholder="وصف تفصيلي..."
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف (إنجليزي)</Label>
                  <Textarea
                    id="description"
                    placeholder="Description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <select
                  id="category"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="" disabled>اختر الفئة...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr} ({cat.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (جنيه) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="299.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">السعر الأصلي (قبل الخصم)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    placeholder="399.99"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">الكمية *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="50"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              {/* المقاسات */}
              <div className="space-y-2">
                <Label>المقاسات المتاحة</Label>
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
                          : 'bg-gray-50 border-gray-300 hover:border-teal-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* الألوان */}
              <div className="space-y-2">
                <Label>الألوان المتاحة</Label>
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
                          : 'border-gray-200 hover:border-teal-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {formData.colors.includes(color.name) && (
                        <div className="text-white font-bold text-center drop-shadow-md">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || images.length === 0}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 ml-2" />
                      حفظ المنتج
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
