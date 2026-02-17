"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Save, Loader2, Gavel, Search, AlertCircle, 
  Calendar, DollarSign, Tag, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";

export default function NewAuctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    startingPrice: "",
    minimumBidIncrement: "10",
    reservePrice: "",
    buyNowPrice: "",
    startDate: "",
    endDate: "",
    featured: false,
    extendOnBid: true,
    termsAndConditions: "",
  });

  // Fetch products on mount - منتجات الشريك فقط
  useEffect(() => {
    fetch("/api/vendor/products?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        const productsList = data.products || [];
        setProducts(productsList);
        setFilteredProducts(productsList);
        console.log('✅ تم جلب', productsList.length, 'منتج للشريك');
      })
      .catch((error) => {
        console.error("❌ Error fetching products:", error);
        toast.error('فشل في جلب المنتجات');
      });
  }, []);

  //Filter products based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      productId: product.id,
      title: product.name || "",
      titleAr: product.nameAr || "",
      description: product.description || "",
      descriptionAr: product.descriptionAr || "",
      startingPrice: product.price?.toString() || "",
    }));
    setShowProductList(false);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productId) {
      toast.error("الرجاء اختيار منتج للمزاد");
      return;
    }
    
    if (!formData.titleAr && !formData.title) {
      toast.error("الرجاء إدخال عنوان المزاد");
      return;
    }

    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
      toast.error("الرجاء إدخال سعر ابتدائي صحيح");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("الرجاء تحديد تاريخ البدء والانتهاء");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast.error("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          title: formData.title,
          titleAr: formData.titleAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
          startingPrice: parseFloat(formData.startingPrice),
          minimumBidIncrement: parseFloat(formData.minimumBidIncrement),
          reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
          buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          featured: formData.featured,
          extendOnBid: formData.extendOnBid,
          termsAndConditions: formData.termsAndConditions || null,
          images: getProductImages(selectedProduct?.images),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("✅ تم إنشاء المزاد بنجاح!");
        router.push("/admin/auctions");
      } else {
        toast.error(data.error || "❌ فشل في إنشاء المزاد");
      }
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("❌ حدث خطأ أثناء إنشاء المزاد");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely parse product images
  const getProductImage = (images: any): string | null => {
    if (!images) return null;
    
    try {
      // If it's already an array
      if (Array.isArray(images)) {
        return images[0] || null;
      }
      
      // If it's a JSON string
      if (typeof images === 'string') {
        // Check if it's a comma-separated list of URLs
        if (images.includes(',') && images.includes('http')) {
          const urls = images.split(',').map(url => url.trim());
          return urls[0] || null;
        }
        
        // Check if it's a single URL (starts with http)
        if (images.startsWith('http')) {
          return images;
        }
        
        // Try to parse as JSON
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed[0] : null;
      }
      
      return null;
    } catch (error) {
      // If parsing fails, return the string if it looks like a URL
      if (typeof images === 'string' && images.startsWith('http')) {
        return images;
      }
      return null;
    }
  };

  // Helper function to get all product images as array
  const getProductImages = (images: any): string[] => {
    if (!images) return [];
    
    try {
      // If it's already an array
      if (Array.isArray(images)) {
        return images;
      }
      
      // If it's a JSON string
      if (typeof images === 'string') {
        // Check if it's a comma-separated list of URLs
        if (images.includes(',') && images.includes('http')) {
          return images.split(',').map(url => url.trim()).filter(url => url.startsWith('http'));
        }
        
        // Check if it's a single URL (starts with http)
        if (images.startsWith('http')) {
          return [images];
        }
        
        // Try to parse as JSON
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      
      return [];
    } catch (error) {
      // If parsing fails, return as single-item array if it looks like a URL
      if (typeof images === 'string' && images.startsWith('http')) {
        return [images];
      }
      return [];
    }
  };

  const productImage = selectedProduct?.images
    ? getProductImage(selectedProduct.images)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/admin/auctions" label="العودة لقائمة المزادات" className="mb-2" />
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <Gavel className="w-10 h-10" />
            إضافة مزاد جديد
          </h1>
          <p className="text-purple-100 mt-2">أنشئ مزاداً جديداً لأحد المنتجات</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Product Selection */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                اختيار المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div>
                <Label>البحث عن منتج</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ابحث بالاسم أو SKU..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowProductList(true);
                    }}
                    onFocus={() => setShowProductList(true)}
                    className="pr-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Product Dropdown */}
              {showProductList && filteredProducts.length > 0 && (
                <div className="max-h-64 overflow-y-auto border rounded-lg bg-white shadow-lg">
                  {filteredProducts.slice(0, 20).map((product) => {
                    const productImg = getProductImage(product.images);
                    
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors text-right border-b last:border-b-0"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {productImg ? (
                            <Image
                              src={productImg}
                              alt={product.nameAr || product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Gavel className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-gray-800">
                            {product.nameAr || product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {product.sku || "---"} | السعر: {product.price} ج.م
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected Product */}
              {selectedProduct && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={selectedProduct.nameAr || selectedProduct.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Gavel className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-purple-800">
                      {selectedProduct.nameAr || selectedProduct.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      SKU: {selectedProduct.sku || "---"}
                    </p>
                    <p className="text-sm text-green-600 font-semibold">
                      السعر الأصلي: {selectedProduct.price} ج.م
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(null);
                      setFormData((prev) => ({ ...prev, productId: "" }));
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    إزالة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auction Details */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                تفاصيل المزاد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleAr">عنوان المزاد (عربي) *</Label>
                  <Input
                    id="titleAr"
                    value={formData.titleAr}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, titleAr: e.target.value }))
                    }
                    placeholder="عنوان المزاد بالعربية"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">عنوان المزاد (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Auction Title in English"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
                <Textarea
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))
                  }
                  placeholder="وصف تفصيلي للمزاد..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Detailed auction description..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                الأسعار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startingPrice">السعر الابتدائي (ج.م) *</Label>
                  <Input
                    id="startingPrice"
                    type="number"
                    step="0.01"
                    value={formData.startingPrice}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, startingPrice: e.target.value }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minimumBidIncrement">
                    الحد الأدنى للزيادة (ج.م) *
                  </Label>
                  <Input
                    id="minimumBidIncrement"
                    type="number"
                    step="0.01"
                    value={formData.minimumBidIncrement}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        minimumBidIncrement: e.target.value,
                      }))
                    }
                    placeholder="10.00"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="reservePrice">سعر الحد الأدنى للبيع (سري)</Label>
                    <div className="group relative">
                      <EyeOff className="w-4 h-4 text-gray-400" />
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48">
                        سعر سري لن يُباع المنتج بأقل منه
                      </div>
                    </div>
                  </div>
                  <Input
                    id="reservePrice"
                    type="number"
                    step="0.01"
                    value={formData.reservePrice}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, reservePrice: e.target.value }))
                    }
                    placeholder="0.00 (اختياري)"
                  />
                </div>

                <div>
                  <Label htmlFor="buyNowPrice">سعر الشراء الفوري (ج.م)</Label>
                  <Input
                    id="buyNowPrice"
                    type="number"
                    step="0.01"
                    value={formData.buyNowPrice}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, buyNowPrice: e.target.value }))
                    }
                    placeholder="0.00 (اختياري)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                التوقيت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاريخ البدء *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, startDate: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">تاريخ الانتهاء *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, endDate: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="extendOnBid"
                  checked={formData.extendOnBid}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, extendOnBid: checked as boolean }))
                  }
                />
                <Label htmlFor="extendOnBid" className="cursor-pointer">
                  تمديد المزاد تلقائياً عند المزايدة في آخر دقائق
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                خيارات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, featured: checked as boolean }))
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer flex items-center gap-2">
                  ⭐ مزاد مميز (يظهر في الأعلى)
                </Label>
              </div>

              <div>
                <Label htmlFor="termsAndConditions">الشروط والأحكام</Label>
                <Textarea
                  id="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      termsAndConditions: e.target.value,
                    }))
                  }
                  placeholder="الشروط والأحكام الخاصة بالمزاد..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  إنشاء المزاد
                </>
              )}
            </Button>

            <Link href="/admin/auctions" className="flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                className="h-full px-8"
                disabled={loading}
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
