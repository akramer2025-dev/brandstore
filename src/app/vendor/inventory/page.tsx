'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft, Package, AlertTriangle, CheckCircle, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VendorInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/vendor/inventory');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: any) => {
    const productValue = (product.productionCost || 0) * product.stock;
    const confirmMessage = `⚠️ هل أنت متأكد من حذف المنتج "${product.nameAr}"؟\n\n` +
      `📦 الكمية: ${product.stock} قطعة\n` +
      `💰 قيمة الشراء: ${productValue.toFixed(2)} ج\n\n` +
      `سيتم إرجاع ${productValue.toFixed(2)} ج إلى رأس المال`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleting(product.id);
    try {
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}`);
        fetchProducts(); // تحديث القائمة
      } else {
        const error = await response.json();
        alert(`❌ خطأ: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(null);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/vendor">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Warehouse className="h-5 w-5 sm:h-8 sm:w-8 text-blue-400" />
                إدارة المخزون
              </h1>
              <p className="text-gray-400 mt-0.5 text-xs sm:text-sm hidden sm:block">متابعة وإدارة مخزون المنتجات</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href="/vendor/products/new" className="flex-1 sm:flex-none">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs sm:text-sm h-8 sm:h-10 w-full">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                منتج
              </Button>
            </Link>
            <Link href="/vendor/purchases/new" className="flex-1 sm:flex-none">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs sm:text-sm h-8 sm:h-10 w-full">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                فاتورة
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-3 sm:p-6">
              <Package className="h-5 w-5 sm:h-8 sm:w-8 text-blue-400 mb-1 sm:mb-3" />
              <p className="text-blue-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">إجمالي القطع</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{totalStock}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-3 sm:p-6">
              <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-400 mb-1 sm:mb-3" />
              <p className="text-green-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">قيمة المخزون</p>
              <p className="text-base sm:text-2xl font-bold text-white">{totalValue.toFixed(0)}<span className="text-xs sm:text-sm mr-1">ج</span></p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-3 sm:p-6">
              <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-orange-400 mb-1 sm:mb-3" />
              <p className="text-orange-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">مخزون منخفض</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{lowStock}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardContent className="p-3 sm:p-6">
              <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-red-400 mb-1 sm:mb-3" />
              <p className="text-red-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">نفذ من المخزن</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{outOfStock}</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory - Mobile: Cards, Desktop: Table */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-white text-sm sm:text-base">تفاصيل المخزون</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {/* Mobile View - Cards */}
            <div className="block md:hidden space-y-2">
              {products.map((product) => (
                <Card key={product.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{product.nameAr}</p>
                        <p className="text-blue-200 text-xs">{product.category?.nameAr}</p>
                      </div>
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] backdrop-blur-sm border border-red-500/30 whitespace-nowrap">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          نفذ
                        </span>
                      ) : product.stock <= 10 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] backdrop-blur-sm border border-orange-500/30 whitespace-nowrap">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          منخفض
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-[10px] backdrop-blur-sm border border-green-500/30 whitespace-nowrap">
                          <CheckCircle className="h-2.5 w-2.5" />
                          متوفر
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <p className="text-gray-400 text-[10px]">الكمية</p>
                        <p className="text-white font-bold text-sm">{product.stock}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[10px]">السعر</p>
                        <p className="text-blue-300 text-sm">{product.price} ج</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[10px]">القيمة</p>
                        <p className="text-white font-bold text-sm">{(product.stock * product.price).toFixed(0)} ج</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <Link href={`/vendor/products/${product.id}/edit`} className="flex-1">
                        <Button 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 w-full h-7 text-xs"
                        >
                          <Edit className="h-3 w-3 ml-1" />
                          تعديل
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        onClick={() => handleDelete(product)}
                        disabled={deleting === product.id}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 h-7 px-3 text-xs"
                      >
                        {deleting === product.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-right py-3 px-4 text-white font-medium">المنتج</th>
                    <th className="text-right py-3 px-4 text-white font-medium">الفئة</th>
                    <th className="text-center py-3 px-4 text-white font-medium">الكمية</th>
                    <th className="text-center py-3 px-4 text-white font-medium">السعر</th>
                    <th className="text-center py-3 px-4 text-white font-medium">القيمة</th>
                    <th className="text-center py-3 px-4 text-white font-medium">الحالة</th>
                    <th className="text-center py-3 px-4 text-white font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">{product.nameAr}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-blue-200">{product.category?.nameAr}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-white font-bold">{product.stock}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-blue-300">{product.price} ج.م</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-white font-bold">{(product.stock * product.price).toFixed(0)} ج.م</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm backdrop-blur-sm border border-red-500/30">
                            <AlertTriangle className="h-3 w-3" />
                            نفذ
                          </span>
                        ) : product.stock <= 10 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm backdrop-blur-sm border border-orange-500/30">
                            <AlertTriangle className="h-3 w-3" />
                            منخفض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm backdrop-blur-sm border border-green-500/30">
                            <CheckCircle className="h-3 w-3" />
                            متوفر
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/vendor/products/${product.id}/edit`}>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(product)}
                            disabled={deleting === product.id}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            {deleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
