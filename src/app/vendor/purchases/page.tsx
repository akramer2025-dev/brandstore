'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, DollarSign, Calendar, User, Loader2, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/vendor/purchases');
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalFromCapital = purchases.reduce((sum, p) => sum + p.totalFromCapital, 0);
  const totalOnBehalf = purchases.reduce((sum, p) => sum + p.totalOnBehalf, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-purple-400" />
              فواتير المشتريات
            </h1>
            <p className="text-gray-400 mt-1">إدارة وعرض جميع فواتير المشتريات</p>
          </div>
          <Link href="/vendor/purchases/new">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              فاتورة جديدة
            </Button>
          </Link>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">عدد الفواتير</p>
                  <p className="text-3xl font-bold text-white">{purchases.length}</p>
                </div>
                <Receipt className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">إجمالي المشتريات</p>
                  <p className="text-3xl font-bold text-white">{totalPurchases.toFixed(2)} ج</p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm mb-1">من رأس المال</p>
                  <p className="text-3xl font-bold text-white">{totalFromCapital.toFixed(2)} ج</p>
                </div>
                <Package className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm mb-1">بيع بالنيابة</p>
                  <p className="text-3xl font-bold text-white">{totalOnBehalf.toFixed(2)} ج</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الفواتير */}
        {purchases.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-20 h-20 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl text-white mb-2">لا توجد فواتير مشتريات</h3>
              <p className="text-gray-400 mb-6">ابدأ بإضافة فاتورة مشتريات جديدة</p>
              <Link href="/vendor/purchases/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  فاتورة جديدة
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase: any, index: number) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-purple-400" />
                      فاتورة #{purchase.receiptNumber || `${index + 1}`}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(purchase.purchaseDate).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {purchase.supplier && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{purchase.supplier}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* المنتجات */}
                  <div className="space-y-2 mb-4">
                    {purchase.items.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">{item.productName}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <span>الكمية: {item.quantity}</span>
                              <span>سعر الشراء: {item.unitCost} ج</span>
                              {item.sellingPrice && <span>سعر البيع: {item.sellingPrice} ج</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.fromCapital ? (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                              من رأس المال
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">
                              بالنيابة
                            </span>
                          )}
                          <p className="text-white font-bold">{item.totalCost.toFixed(2)} ج</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* الإجماليات */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">الإجمالي</p>
                      <p className="text-xl font-bold text-white">{purchase.totalCost.toFixed(2)} ج</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">من رأس المال</p>
                      <p className="text-xl font-bold text-blue-400">{purchase.totalFromCapital.toFixed(2)} ج</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">بالنيابة</p>
                      <p className="text-xl font-bold text-orange-400">{purchase.totalOnBehalf.toFixed(2)} ج</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
