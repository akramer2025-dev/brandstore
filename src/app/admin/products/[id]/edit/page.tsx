"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  stock: number;
  images: string | null;
  categoryId: string;
  vendorId: string | null;
  colors?: string[];
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    stock: "",
    images: "",
    colors: [] as string[],
  });

  // ألوان مستحضرات التجميل (Foundation Shades)
  const cosmeticColors = [
    { name: 'Ivory', value: 'ivory', hex: '#FFF8E7' },
    { name: 'Porcelain', value: 'porcelain', hex: '#FFEFD5' },
    { name: 'Fair', value: 'fair', hex: '#FFE4C4' },
    { name: 'Light', value: 'light', hex: '#FFDEAD' },
    { name: 'Light Medium', value: 'light-medium', hex: '#E8C5A5' },
    { name: 'Beige', value: 'beige', hex: '#D4A574' },
    { name: 'Medium', value: 'medium', hex: '#C19A6B' },
    { name: 'Warm Honey', value: 'warm-honey', hex: '#C68642' },
    { name: 'Tan', value: 'tan', hex: '#D2B48C' },
    { name: 'Golden', value: 'golden', hex: '#DAA520' },
    { name: 'Caramel', value: 'caramel', hex: '#AF6E4D' },
    { name: 'Bronze', value: 'bronze', hex: '#8B4513' },
    { name: 'Deep', value: 'deep', hex: '#8B7355' },
    { name: 'Rich', value: 'rich', hex: '#704214' },
    { name: 'Cocoa', value: 'cocoa', hex: '#5C4033' },
    { name: 'Espresso', value: 'espresso', hex: '#4B3621' },
    { name: 'Ebony', value: 'ebony', hex: '#3D2817' },
    { name: 'Mahogany', value: 'mahogany', hex: '#6F4E37' },
  ];

  // الألوان العامة (للملابس والمنتجات الأخرى)
  const generalColors = [
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
    { name: 'برتقالي', value: 'orange', hex: '#F97316' },
    { name: 'أزرق فاتح', value: 'light-blue', hex: '#38BDF8' },
    { name: 'أخضر فاتح', value: 'light-green', hex: '#4ADE80' },
    { name: 'أحمر داكن', value: 'dark-red', hex: '#B91C1C' },
    { name: 'بيج', value: 'beige', hex: '#D4A574' },
    { name: 'كريمي', value: 'cream', hex: '#FFF8DC' },
    { name: 'كحلي', value: 'navy', hex: '#1E3A8A' },
    { name: 'زيتي', value: 'olive', hex: '#6B7D2C' },
    { name: 'فيروزي', value: 'turquoise', hex: '#14B8A6' },
    { name: 'موف', value: 'mauve', hex: '#9333EA' },
  ];
  
  // اختيار الألوان حسب الفئة
  const selectedCategory = categories.find(cat => cat.id === product?.categoryId);
  const isCosmeticCategory = selectedCategory?.nameAr?.includes('تجميل') || 
                            selectedCategory?.name?.toLowerCase().includes('cosmetic') ||
                            selectedCategory?.name?.toLowerCase().includes('makeup') ||
                            selectedCategory?.name?.toLowerCase().includes('beauty');
  
  const availableColors = isCosmeticCategory ? cosmeticColors : generalColors;

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('خطأ في تحميل الفئات:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      if (!response.ok) throw new Error("فشل تحميل المنتج");
      
      const data = await response.json();
      setProduct(data);
      
      // تحويل الألوان من string إلى array إذا كانت موجودة
      let colorsArray: string[] = [];
      if (data.colors) {
        try {
          colorsArray = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors;
        } catch {
          colorsArray = [];
        }
      }
      
      setFormData({
        name: data.name || "",
        nameAr: data.nameAr || "",
        description: data.description || "",
        descriptionAr: data.descriptionAr || "",
        price: data.price?.toString() || "",
        stock: data.stock?.toString() || "",
        images: data.images || "",
        colors: colorsArray,
      });
    } catch (error) {
      console.error("خطأ في تحميل المنتج:", error);
      toast.error("فشل تحميل بيانات المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleColorToggle = (colorName: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorName)
        ? prev.colors.filter(c => c !== colorName)
        : [...prev.colors, colorName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          colors: JSON.stringify(formData.colors), // تحويل الألوان لـ JSON string
        }),
      });

      if (!response.ok) throw new Error("فشل تحديث المنتج");

      toast.success("تم تحديث المنتج بنجاح");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("خطأ في تحديث المنتج:", error);
      toast.error("حدث خطأ أثناء تحديث المنتج");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
            <Link href="/admin/products">
              <Button>العودة للمنتجات</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للمنتجات
          </Link>
          <h1 className="text-4xl font-bold drop-shadow-lg">تعديل المنتج</h1>
          <p className="text-teal-100 mt-2">{product.nameAr}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>بيانات المنتج</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">الاسم بالإنجليزية</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionAr">الوصف بالعربية *</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف بالإنجليزية</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (جنيه) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">الكمية المتاحة *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">روابط الصور (مفصولة بفاصلة)</Label>
                <Textarea
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  rows={3}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>

              {/* قسم الألوان */}
              <div className="space-y-3">
                <Label>
                  {isCosmeticCategory ? 'درجات Foundation المتاحة' : 'الألوان المتاحة'}
                  <span className="text-xs text-gray-500 mr-2">
                    ({formData.colors.length} محددة)
                  </span>
                </Label>
                <div className={`grid gap-3 ${isCosmeticCategory ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  {availableColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleColorToggle(color.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        formData.colors.includes(color.name)
                          ? 'border-teal-500 ring-2 ring-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-400 bg-white'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        {formData.colors.includes(color.name) && (
                          <div 
                            className="text-xl font-bold"
                            style={{ 
                              color: ['#FFFFFF', '#FFF8E7', '#FFEFD5', '#FFE4C4', '#FFDEAD', '#FFF8DC'].includes(color.hex) 
                                ? '#000000' 
                                : '#FFFFFF' 
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <span 
                        className="text-xs text-center font-medium"
                        style={{ 
                          maxWidth: '70px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
                {formData.colors.length === 0 && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ لم يتم اختيار أي ألوان. اختر الألوان المتاحة للمنتج.
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
                <Link href="/admin/products" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
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
