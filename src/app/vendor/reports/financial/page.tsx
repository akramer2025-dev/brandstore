'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Percent,
  Calendar,
  FileText,
  Download,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // تعيين تاريخ افتراضي (آخر 30 يوم)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
    
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/vendor/reports/financial?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <p className="text-white">لا توجد بيانات</p>
      </div>
    );
  }

  const {
    capital,
    purchases,
    sales,
    expenses,
    summary
  } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton fallbackUrl="/vendor/reports" />
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-400" />
                التقارير المالية
              </h1>
              <p className="text-gray-400 mt-1">نظرة شاملة على الوضع المالي والأرباح</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            تصدير Excel
          </Button>
        </div>

        {/* فلتر التواريخ */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="startDate" className="text-white mb-2 block">من تاريخ</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="text-white mb-2 block">إلى تاريخ</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Calendar className="w-4 h-4 mr-2" />
                عرض التقرير
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* رأس المال */}
        {capital && (
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                رأس المال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <p className="text-green-200 text-sm mb-1">رأس المال الأولي</p>
                  <p className="text-2xl font-bold text-white">{capital.initialAmount.toLocaleString()} ج</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <p className="text-green-200 text-sm mb-1">المتبقي حالياً</p>
                  <p className="text-2xl font-bold text-white">{capital.currentAmount.toLocaleString()} ج</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <p className="text-green-200 text-sm mb-1">المستخدم</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(capital.initialAmount - capital.currentAmount).toLocaleString()} ج
                  </p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <p className="text-green-200 text-sm mb-1">نسبة الاستخدام</p>
                  <p className="text-2xl font-bold text-white">
                    {((capital.initialAmount - capital.currentAmount) / capital.initialAmount * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* الملخص العام */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm mb-1">إجمالي المشتريات</p>
                  <p className="text-3xl font-bold text-white">{summary.totalPurchases.toFixed(2)} ج</p>
                  <p className="text-xs text-blue-300 mt-1">
                    من رأس المال: {summary.purchasesFromCapital.toFixed(2)} ج
                  </p>
                </div>
                <ShoppingCart className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm mb-1">إجمالي المبيعات</p>
                  <p className="text-3xl font-bold text-white">{summary.totalSales.toFixed(2)} ج</p>
                  <p className="text-xs text-green-300 mt-1 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    ربح: {summary.totalProfit.toFixed(2)} ج
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm mb-1">إجمالي المصروفات</p>
                  <p className="text-3xl font-bold text-white">{summary.totalExpenses.toFixed(2)} ج</p>
                  <p className="text-xs text-red-300 mt-1 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" />
                    من رأس المال
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm mb-1">عمولة المتجر 5%</p>
                  <p className="text-3xl font-bold text-white">{summary.totalCommission.toFixed(2)} ج</p>
                  <p className="text-xs text-yellow-300 mt-1">من المبيعات</p>
                </div>
                <Percent className="w-12 h-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* صافي الربح */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-purple-200 text-lg mb-2">صافي الربح</p>
              <p className="text-5xl font-bold text-white mb-2">
                {summary.netProfit.toFixed(2)} ج
              </p>
              <p className="text-sm text-purple-300">
                (الربح - العمولة - المصروفات)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-white/10 rounded">
                <p className="text-xs text-gray-300">إجمالي الربح</p>
                <p className="text-lg font-bold text-green-400">+{summary.totalProfit.toFixed(2)} ج</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded">
                <p className="text-xs text-gray-300">العمولة + المصروفات</p>
                <p className="text-lg font-bold text-red-400">-{(summary.totalCommission + summary.totalExpenses).toFixed(2)} ج</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded">
                <p className="text-xs text-gray-300">هامش الربح</p>
                <p className="text-lg font-bold text-purple-400">
                  {summary.totalSales > 0 ? ((summary.netProfit / summary.totalSales) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل المشتريات */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              تفاصيل المشتريات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-blue-200 text-sm mb-1">من رأس المال</p>
                <p className="text-2xl font-bold text-blue-400">{summary.purchasesFromCapital.toFixed(2)} ج</p>
                <p className="text-xs text-blue-300 mt-1">{purchases.fromCapital.length} فاتورة</p>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                <p className="text-orange-200 text-sm mb-1">بيع بالنيابة</p>
                <p className="text-2xl font-bold text-orange-400">{summary.purchasesOnBehalf.toFixed(2)} ج</p>
                <p className="text-xs text-orange-300 mt-1">{purchases.onBehalf.length} منتج</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-yellow-200 text-sm mb-1">مصاريف مشاوير</p>
                <p className="text-2xl font-bold text-yellow-400">{summary.tripExpenses.toFixed(2)} ج</p>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <p className="text-purple-200 text-sm mb-1">إجمالي التكلفة</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(summary.totalPurchases + summary.tripExpenses).toFixed(2)} ج
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل المبيعات */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              تفاصيل المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-green-200 text-sm mb-1">عدد المبيعات</p>
                <p className="text-2xl font-bold text-green-400">{sales.count}</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-blue-200 text-sm mb-1">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-blue-400">{summary.totalSales.toFixed(2)} ج</p>
              </div>
              <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                <p className="text-emerald-200 text-sm mb-1">إجمالي الربح</p>
                <p className="text-2xl font-bold text-emerald-400">{summary.totalProfit.toFixed(2)} ج</p>
              </div>
              <div className="text-center p-4 bg-teal-500/10 rounded-lg">
                <p className="text-teal-200 text-sm mb-1">متوسط الربح/بيعة</p>
                <p className="text-2xl font-bold text-teal-400">
                  {sales.count > 0 ? (summary.totalProfit / sales.count).toFixed(2) : 0} ج
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل المصروفات */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              تفاصيل المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.byType.map((exp: any) => (
                <div key={exp.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">{exp.typeAr}</span>
                  <span className="text-red-400 font-bold">{exp.total.toFixed(2)} ج</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
