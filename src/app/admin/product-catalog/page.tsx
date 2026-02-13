"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Download,
  FileCode,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.remostore.net";
  const feedUrl = `${baseUrl}/api/products/feed`;
  const csvUrl = `${baseUrl}/api/products/feed?format=csv`;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeProducts = products.filter((p) => p.isActive && p.stock > 0);
  const totalValue = activeProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6 sm:py-8 md:py-12 shadow-2xl">
        <div className="container mx-auto px-3 sm:px-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            ← العودة للوحة الإدارة
          </Link>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg mb-1 sm:mb-2">
                📦 كتالوج المنتجات (Product Feed)
              </h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg">
                كتالوج XML/CSV لاستخدامه في Facebook, Google Shopping & Instagram
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-blue-100">إجمالي المنتجات</p>
                  <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
                </div>
                <Package className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-100">منتجات نشطة</p>
                  <p className="text-2xl sm:text-3xl font-bold">{activeProducts.length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-purple-100">قيمة المخزون</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalValue.toLocaleString()} ج
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-orange-100">بدون صور</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {products.filter((p) => !p.images).length}
                  </p>
                </div>
                <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">روابط الكتالوج</TabsTrigger>
            <TabsTrigger value="preview">معاينة</TabsTrigger>
            <TabsTrigger value="guide">الدليل</TabsTrigger>
          </TabsList>

          {/* Feed URLs Tab */}
          <TabsContent value="feed" className="space-y-6">
            <Card className="border-2 border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileCode className="w-6 h-6" />
                  روابط الكتالوج (Product Feed URLs)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* XML Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">🔤 XML Feed (موصى به)</h3>
                    <Badge variant="secondary">RSS/ATOM</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    استخدم هذا الرابط في Facebook Catalog و Google Merchant Center
                  </p>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
                      {feedUrl}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(feedUrl)}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(feedUrl, "_blank")}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      معاينة XML
                    </Button>
                    <Button
                      onClick={() => window.open(feedUrl, "_blank")}
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      فتح في تبويب جديد
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* CSV Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">📊 CSV Feed</h3>
                    <Badge variant="secondary">Spreadsheet</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    تنزيل ملف CSV لاستيراده يدوياً أو استخدامه في أدوات أخرى
                  </p>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm overflow-x-auto">
                      {csvUrl}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(csvUrl)}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.location.href = csvUrl}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      تحميل CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Setup Guide */}
            <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <AlertCircle className="w-6 h-6" />
                  خطوات سريعة للربط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">انسخ رابط XML أعلاه</h4>
                      <p className="text-sm text-gray-600">
                        https://www.remostore.net/api/products/feed
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">اذهب إلى Facebook Commerce Manager</h4>
                      <a
                        href="https://business.facebook.com/commerce"
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        facebook.com/commerce
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">أنشئ كتالوج جديد</h4>
                      <p className="text-sm text-gray-600">
                        اختر &quot;E-commerce&quot; ثم &quot;Add Items&quot; {'->'} &quot;Use Data Feed&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">الصق الرابط</h4>
                      <p className="text-sm text-gray-600">
                        اختر "Scheduled Feed" واجعله يتحدث يومياً
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>نصيحة:</strong> الكتالوج يتحدث تلقائياً كل مرة يتم الوصول
                    إليه. Facebook سيقوم بتحديثه يومياً حسب الجدول الذي تحدده.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>معاينة المنتجات ({activeProducts.length})</CardTitle>
                <Button onClick={fetchProducts} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تحديث
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                  ) : activeProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد منتجات نشطة
                    </div>
                  ) : (
                    activeProducts.slice(0, 10).map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images ? (
                            <img
                              src={(() => {
                                try {
                                  if (typeof product.images === "string") {
                                    // Check if it's a JSON array or direct URL
                                    if (product.images.startsWith("[") || product.images.startsWith("{")) {
                                      const parsed = JSON.parse(product.images);
                                      return Array.isArray(parsed) ? parsed[0] : parsed;
                                    }
                                    // Direct URL
                                    return product.images;
                                  }
                                  return Array.isArray(product.images) ? product.images[0] : product.images;
                                } catch (e) {
                                  return product.images;
                                }
                              })()}
                              alt={product.nameAr}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{product.nameAr}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.descriptionAr}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.price} ج
                            </Badge>
                            <Badge
                              variant={product.stock > 10 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              مخزون: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {activeProducts.length > 10 && (
                    <p className="text-center text-sm text-gray-500">
                      وهناك {activeProducts.length - 10} منتج آخر...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle>📚 دليل الاستخدام الكامل</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>للحصول على الدليل الكامل لإعداد الكتالوج، راجع:</p>
                <Link
                  href="/PRODUCT_CATALOG_GUIDE.md"
                  className="text-blue-600 hover:underline font-semibold"
                  target="_blank"
                >
                  PRODUCT_CATALOG_GUIDE.md
                </Link>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-bold">روابط مفيدة</h3>
                  <ul>
                    <li>
                      <a
                        href="https://business.facebook.com/commerce"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Facebook Commerce Manager
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.facebook.com/business/help/120325381656392"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Facebook Product Catalog Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.facebook.com/business/help/455326144628161"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Dynamic Ads Guide
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
