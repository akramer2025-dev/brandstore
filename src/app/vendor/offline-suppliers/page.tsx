'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package,
  Phone,
  MapPin,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  stats: {
    totalPurchases: number;
    totalProfit: number;
    pendingAmount: number;
    totalProducts: number;
  };
}

export default function OfflineSuppliersPage() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/vendor/offline-suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات الإجمالية
  const totalStats = suppliers.reduce(
    (acc, supplier) => ({
      totalPurchases: acc.totalPurchases + supplier.stats.totalPurchases,
      totalProfit: acc.totalProfit + supplier.stats.totalProfit,
      totalPending: acc.totalPending + supplier.stats.pendingAmount,
      totalProducts: acc.totalProducts + supplier.stats.totalProducts,
    }),
    { totalPurchases: 0, totalProfit: 0, totalPending: 0, totalProducts: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8" />
            موردين البضاعة الخارجية
          </h1>
          <p className="text-gray-300 mt-2">إدارة ومتابعة الموردين والمستحقات</p>
        </div>

        {/* إحصائيات إجمالية */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">إجمالي المشتريات</p>
                  <p className="text-2xl font-bold text-white">{totalStats.totalPurchases.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">الأرباح</p>
                  <p className="text-2xl font-bold text-green-400">{totalStats.totalProfit.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">المستحقات</p>
                  <p className="text-2xl font-bold text-red-400">{totalStats.totalPending.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <FileText className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">عدد الموردين</p>
                  <p className="text-2xl font-bold text-purple-400">{suppliers.length}</p>
                  <p className="text-xs text-gray-400">مورد</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الموردين */}
        {suppliers.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">لا يوجد موردين مسجلين</p>
              <p className="text-gray-500 text-sm mt-2">قم بإضافة مورد من صفحة البضاعة الخارجية</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-1">{supplier.name}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                        {supplier.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {supplier.phone}
                          </span>
                        )}
                        {supplier.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {supplier.address}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
                      size="sm"
                      variant="ghost"
                      className="text-white"
                    >
                      {expandedSupplier === supplier.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* إحصائيات المورد */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 bg-blue-500/20 rounded-lg">
                      <p className="text-xs text-gray-300">المشتريات</p>
                      <p className="text-lg font-bold text-blue-400">{supplier.stats.totalPurchases.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-2 bg-green-500/20 rounded-lg">
                      <p className="text-xs text-gray-300">الربح</p>
                      <p className="text-lg font-bold text-green-400">{supplier.stats.totalProfit.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/20 rounded-lg">
                      <p className="text-xs text-gray-300">المستحق</p>
                      <p className="text-lg font-bold text-red-400">{supplier.stats.pendingAmount.toFixed(0)}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-500/20 rounded-lg">
                      <p className="text-xs text-gray-300">المعاملات</p>
                      <p className="text-lg font-bold text-purple-400">{supplier.stats.totalProducts}</p>
                    </div>
                  </div>

                  {/* التفاصيل الموسعة */}
                  {expandedSupplier === supplier.id && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      {supplier.notes && (
                        <div className="mb-3">
                          <p className="text-gray-400 text-sm flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4" />
                            ملاحظات:
                          </p>
                          <p className="text-white text-sm">{supplier.notes}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-400 text-xs">
                          تاريخ الإضافة: {new Date(supplier.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
