'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  FileSpreadsheet,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Download,
  Wallet,
  Edit,
  Trash2,
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface OfflineProduct {
  id: string;
  productName?: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  soldQuantity: number;
  profit: number;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  stats: {
    totalPurchases: number;
    totalPaid: number;
    totalProfit: number;
    pendingAmount: number;
    totalProducts: number;
    remainingQuantity: number;
    remainingCost: number;
    remainingExpectedRevenue: number;
    soldRevenue: number;
  };
  products: OfflineProduct[];
}

interface CapitalInfo {
  initial: number;
  current: number;
}

export default function OfflineProductsReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [noSupplierProducts, setNoSupplierProducts] = useState<OfflineProduct[]>([]);
  const [capitalInfo, setCapitalInfo] = useState<CapitalInfo>({ initial: 7500, current: 7500 });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
    fetchCapital();
  }, []);

  const fetchCapital = async () => {
    try {
      const response = await fetch('/api/vendor/capital');
      if (response.ok) {
        const data = await response.json();
        setCapitalInfo({
          current: data.capitalBalance || 0,
          initial: data.capitalBalance || 0
        });
      }
    } catch (error) {
      console.error('Error fetching capital:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        fetch('/api/vendor/offline-suppliers'),
        fetch('/api/vendor/offline-products'),
      ]);

      if (suppliersRes.ok && productsRes.ok) {
        const suppliersData = await suppliersRes.json();
        const allProductsData = await productsRes.json();
        
        // ربط المنتجات بكل وسيط
        const suppliersWithProducts = suppliersData.suppliers.map((supplier: Supplier) => {
          const supplierProducts = allProductsData.offlineProducts.filter(
            (p: any) => p.supplier?.id === supplier.id
          );
          return {
            ...supplier,
            products: supplierProducts
          };
        });
        
        setSuppliers(suppliersWithProducts);
        
        // تعيين التبويب النشط
        if (suppliersWithProducts.length > 0) {
          // عرض جميع الوسطاء افتراضياً
          setActiveTab('all');
        } else if (noSupplier.length > 0) {
          setActiveTab('no-supplier');
        }
        
        // المنتجات بدون وسيط
        const noSupplier = allProductsData.offlineProducts.filter(
          (p: any) => !p.supplier
        );
        setNoSupplierProducts(noSupplier);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (products: OfflineProduct[]) => {
    return products.reduce((acc, product) => {
      const remainingQty = product.quantity - product.soldQuantity;
      const soldRevenue = product.sellingPrice * product.soldQuantity;
      const remainingRevenue = product.sellingPrice * remainingQty;
      const totalCost = product.purchasePrice * product.quantity;
      
      return {
        totalQuantity: acc.totalQuantity + product.quantity,
        soldQuantity: acc.soldQuantity + product.soldQuantity,
        remainingQuantity: acc.remainingQuantity + remainingQty,
        totalCost: acc.totalCost + totalCost,
        soldRevenue: acc.soldRevenue + soldRevenue,
        remainingRevenue: acc.remainingRevenue + remainingRevenue,
        totalProfit: acc.totalProfit + product.profit,
      };
    }, {
      totalQuantity: 0,
      soldQuantity: 0,
      remainingQuantity: 0,
      totalCost: 0,
      soldRevenue: 0,
      remainingRevenue: 0,
      totalProfit: 0,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  const activeSupplier = suppliers.find(s => s.id === activeTab);
  const displayProducts = activeTab === 'no-supplier' ? noSupplierProducts : (activeSupplier?.products || []);
  const totals = calculateTotals(displayProducts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/30 to-purple-900/50 backdrop-blur-xl border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackUrl="/vendor/offline-products" />
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">تقرير البضائع حسب الوسطاء</h1>
                <p className="text-purple-300 text-sm mt-1">عرض تفصيلي لكل وسيط على حدة</p>
              </div>
            </div>
            <Button
              onClick={handlePrint}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Download className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 print:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setActiveTab('all')}
              variant={activeTab === 'all' ? 'default' : 'outline'}
              className={`whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 ml-2" />
              جميع الوسطاء
            </Button>
            {suppliers.map((supplier) => (
              <Button
                key={supplier.id}
                onClick={() => setActiveTab(supplier.id)}
                variant={activeTab === supplier.id ? 'default' : 'outline'}
                className={`whitespace-nowrap ${
                  activeTab === supplier.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {supplier.name}
              </Button>
            ))}
            {noSupplierProducts.length > 0 && (
              <Button
                onClick={() => setActiveTab('no-supplier')}
                variant={activeTab === 'no-supplier' ? 'default' : 'outline'}
                className={`whitespace-nowrap ${
                  activeTab === 'no-supplier'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                بدون وسيط
              </Button>
            )}
          </div>
        </div>

        {/* عرض جميع الوسطاء */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {suppliers.map((supplier) => {
              const supplierTotals = calculateTotals(supplier.products);
              const capitalAfterSales = capitalInfo.current;
              const expectedCapital = capitalInfo.current + supplierTotals.remainingRevenue;
              
              return (
                <Card key={supplier.id} className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardHeader className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div>
                        <div className="text-2xl">{supplier.name}</div>
                        {supplier.phone && (
                          <div className="text-sm text-blue-300 font-normal mt-1">📱 {supplier.phone}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-200">إجمالي البضائع</div>
                        <div className="text-3xl font-black">{supplier.products.length}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* معلومات رأس المال */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg">
                      <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        💰 حركة رأس المال مع {supplier.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-gray-400 mb-1">1️⃣ أديتله بضاعة بـ:</p>
                          <p className="text-red-400 text-xl font-bold">{supplierTotals.totalCost.toFixed(0)} ج</p>
                          <p className="text-xs text-red-300 mt-1">من رأس المال {capitalInfo.initial.toFixed(0)} ج</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-gray-400 mb-1">2️⃣ باع بضاعة بـ:</p>
                          <p className="text-emerald-400 text-xl font-bold">{supplierTotals.soldRevenue.toFixed(0)} ج</p>
                          <p className="text-xs text-emerald-300 mt-1">{supplierTotals.soldQuantity} قطعة</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-gray-400 mb-1">3️⃣ باقي عنده:</p>
                          <p className="text-yellow-400 text-xl font-bold">{supplierTotals.remainingRevenue.toFixed(0)} ج</p>
                          <p className="text-xs text-yellow-300 mt-1">{supplierTotals.remainingQuantity} قطعة</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-gray-400 mb-1">4️⃣ رأس المال حالياً:</p>
                          <p className="text-blue-400 text-xl font-bold">{capitalAfterSales.toFixed(0)} ج</p>
                          <p className="text-xs text-blue-300 mt-1">بعد البيع</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <p className="text-gray-400 mb-1">5️⃣ متوقع يبقى:</p>
                          <p className="text-green-400 text-xl font-bold">{expectedCapital.toFixed(0)} ج</p>
                          <p className="text-xs text-green-300 mt-1">لو باع كل شيء</p>
                        </div>
                      </div>
                    </div>
                    {/* إحصائيات */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">الكمية الكلية</p>
                        <p className="text-white text-2xl font-bold">{supplierTotals.totalQuantity}</p>
                        <p className="text-green-400 text-xs">مباع: {supplierTotals.soldQuantity}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">التكلفة</p>
                        <p className="text-red-400 text-2xl font-bold">{supplierTotals.totalCost.toFixed(0)}</p>
                        <p className="text-gray-400 text-xs">ج</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">المحصل</p>
                        <p className="text-emerald-400 text-2xl font-bold">{supplierTotals.soldRevenue.toFixed(0)}</p>
                        <p className="text-gray-400 text-xs">ج</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">المتوقع</p>
                        <p className="text-blue-400 text-2xl font-bold">{supplierTotals.remainingRevenue.toFixed(0)}</p>
                        <p className="text-gray-400 text-xs">من {supplierTotals.remainingQuantity} قطعة</p>
                      </div>
                    </div>

                    {/* جدول المنتجات */}
                    {supplier.products.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-right p-2 text-gray-300">#</th>
                              <th className="text-right p-2 text-gray-300">الوصف</th>
                              <th className="text-center p-2 text-gray-300">الكمية</th>
                              <th className="text-center p-2 text-gray-300">مباع</th>
                              <th className="text-center p-2 text-gray-300">متبقي</th>
                              <th className="text-right p-2 text-gray-300">سعر الشراء</th>
                              <th className="text-right p-2 text-gray-300">سعر البيع</th>
                              <th className="text-right p-2 text-gray-300">الربح المتوقع</th>
                            </tr>
                          </thead>
                          <tbody>
                            {supplier.products.map((product, index) => {
                              const remaining = product.quantity - product.soldQuantity;
                              return (
                                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="p-2 text-gray-400">{index + 1}</td>
                                  <td className="p-2 text-white">{product.productName || product.description || 'بضاعة'}</td>
                                  <td className="p-2 text-center text-yellow-400">{product.quantity}</td>
                                  <td className="p-2 text-center text-emerald-400">{product.soldQuantity}</td>
                                  <td className="p-2 text-center text-blue-400">{remaining}</td>
                                  <td className="p-2 text-red-400">{product.purchasePrice.toFixed(0)} ج</td>
                                  <td className="p-2 text-green-400">{product.sellingPrice.toFixed(0)} ج</td>
                                  <td className="p-2 text-green-400 font-bold">{product.profit.toFixed(0)} ج</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-8">لا توجد بضائع لهذا الوسيط</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* البضائع بدون وسيط */}
            {noSupplierProducts.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader className="bg-gradient-to-r from-amber-600/20 to-orange-600/20">
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="text-2xl">بضائع بدون وسيط</div>
                    <div className="text-right">
                      <div className="text-sm text-amber-200">إجمالي البضائع</div>
                      <div className="text-3xl font-black">{noSupplierProducts.length}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* نفس المحتوى للبضائع بدون وسيط */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-right p-2 text-gray-300">#</th>
                          <th className="text-right p-2 text-gray-300">الوصف</th>
                          <th className="text-center p-2 text-gray-300">الكمية</th>
                          <th className="text-center p-2 text-gray-300">مباع</th>
                          <th className="text-center p-2 text-gray-300">متبقي</th>
                          <th className="text-right p-2 text-gray-300">سعر الشراء</th>
                          <th className="text-right p-2 text-gray-300">سعر البيع</th>
                          <th className="text-right p-2 text-gray-300">الربح</th>
                        </tr>
                      </thead>
                      <tbody>
                        {noSupplierProducts.map((product, index) => {
                          const remaining = product.quantity - product.soldQuantity;
                          return (
                            <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-2 text-gray-400">{index + 1}</td>
                              <td className="p-2 text-white">{product.productName || product.description || 'بضاعة'}</td>
                              <td className="p-2 text-center text-yellow-400">{product.quantity}</td>
                              <td className="p-2 text-center text-emerald-400">{product.soldQuantity}</td>
                              <td className="p-2 text-center text-blue-400">{remaining}</td>
                              <td className="p-2 text-red-400">{product.purchasePrice.toFixed(0)} ج</td>
                              <td className="p-2 text-green-400">{product.sellingPrice.toFixed(0)} ج</td>
                              <td className="p-2 text-green-400 font-bold">{product.profit.toFixed(0)} ج</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* عرض وسيط واحد */}
        {activeTab !== 'all' && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
              <CardTitle className="text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl mb-2">
                      {activeTab === 'no-supplier' ? 'بضائع بدون وسيط' : activeSupplier?.name}
                    </div>
                    {activeTab !== 'no-supplier' && activeSupplier?.phone && (
                      <div className="text-sm text-blue-300 font-normal">📱 {activeSupplier.phone}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-200">إجمالي البضائع</div>
                    <div className="text-4xl font-black">{displayProducts.length}</div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* معلومات رأس المال */}
              {activeTab !== 'no-supplier' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg">
                  <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    💰 حركة رأس المال مع {activeSupplier?.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-2">1️⃣ أديتله بضاعة بـ</p>
                      <p className="text-red-400 text-3xl font-bold mb-1">{totals.totalCost.toFixed(0)}</p>
                      <p className="text-gray-300">جنيه</p>
                      <p className="text-xs text-red-300 mt-2">من رأس المال {capitalInfo.initial.toFixed(0)} ج</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-2">2️⃣ باع بضاعة بـ</p>
                      <p className="text-emerald-400 text-3xl font-bold mb-1">{totals.soldRevenue.toFixed(0)}</p>
                      <p className="text-gray-300">جنيه</p>
                      <p className="text-xs text-emerald-300 mt-2">باع {totals.soldQuantity} قطعة</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-2">3️⃣ باقي عنده بضاعة</p>
                      <p className="text-yellow-400 text-3xl font-bold mb-1">{totals.remainingRevenue.toFixed(0)}</p>
                      <p className="text-gray-300">جنيه</p>
                      <p className="text-xs text-yellow-300 mt-2">في {totals.remainingQuantity} قطعة</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-2">4️⃣ رأس المال حالياً</p>
                      <p className="text-blue-400 text-3xl font-bold mb-1">{capitalInfo.current.toFixed(0)}</p>
                      <p className="text-gray-300">جنيه</p>
                      <p className="text-xs text-blue-300 mt-2">الرصيد بعد البيع</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-2">5️⃣ متوقع يبقى</p>
                      <p className="text-green-400 text-3xl font-bold mb-1">{(capitalInfo.current + totals.remainingRevenue).toFixed(0)}</p>
                      <p className="text-gray-300">جنيه</p>
                      <p className="text-xs text-green-300 mt-2">لو باع كل شيء</p>
                    </div>
                  </div>
                </div>
              )}

              {/* إحصائيات */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 p-4 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="text-gray-300 text-sm">الكمية الكلية</p>
                  <p className="text-white text-3xl font-bold">{totals.totalQuantity}</p>
                  <p className="text-emerald-400 text-sm mt-1">مباع: {totals.soldQuantity} | متبقي: {totals.remainingQuantity}</p>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 p-4 rounded-lg border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-sm">التكلفة الإجمالية</p>
                  <p className="text-white text-3xl font-bold">{totals.totalCost.toFixed(0)}</p>
                  <p className="text-red-300 text-sm mt-1">مخصومة من رأس المال</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 p-4 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-gray-300 text-sm">المبيعات المحصلة</p>
                  <p className="text-white text-3xl font-bold">{totals.soldRevenue.toFixed(0)}</p>
                  <p className="text-emerald-300 text-sm mt-1">من {totals.soldQuantity} قطعة</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-4 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-300 text-sm">المبيعات المتوقعة</p>
                  <p className="text-white text-3xl font-bold">{totals.remainingRevenue.toFixed(0)}</p>
                  <p className="text-blue-300 text-sm mt-1">من {totals.remainingQuantity} قطعة متبقية</p>
                </div>
              </div>

              {/* جدول البضائع */}
              {displayProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-white/20 bg-white/5">
                        <th className="text-right p-3 text-gray-300 font-bold">#</th>
                        <th className="text-right p-3 text-gray-300 font-bold">الوصف</th>
                        <th className="text-center p-3 text-gray-300 font-bold">الكمية الكلية</th>
                        <th className="text-center p-3 text-gray-300 font-bold">مباع</th>
                        <th className="text-center p-3 text-gray-300 font-bold">متبقي</th>
                        <th className="text-right p-3 text-gray-300 font-bold">سعر الشراء</th>
                        <th className="text-right p-3 text-gray-300 font-bold">سعر البيع</th>
                        <th className="text-right p-3 text-gray-300 font-bold">التكلفة</th>
                        <th className="text-right p-3 text-gray-300 font-bold">المحصل</th>
                        <th className="text-right p-3 text-gray-300 font-bold">المتوقع</th>
                        <th className="text-right p-3 text-gray-300 font-bold">الربح</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayProducts.map((product, index) => {
                        const remaining = product.quantity - product.soldQuantity;
                        const totalCost = product.purchasePrice * product.quantity;
                        const soldRevenue = product.sellingPrice * product.soldQuantity;
                        const remainingRevenue = product.sellingPrice * remaining;
                        
                        return (
                          <tr key={product.id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                            <td className="p-3 text-gray-400 font-medium">{index + 1}</td>
                            <td className="p-3 text-white">{product.productName || product.description || 'بضاعة'}</td>
                            <td className="p-3 text-center">
                              <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-bold">
                                {product.quantity}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
                                {product.soldQuantity}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-bold">
                                {remaining}
                              </span>
                            </td>
                            <td className="p-3 text-red-400 font-semibold">{product.purchasePrice.toFixed(0)} ج</td>
                            <td className="p-3 text-green-400 font-semibold">{product.sellingPrice.toFixed(0)} ج</td>
                            <td className="p-3 text-red-400 font-bold">{totalCost.toFixed(0)} ج</td>
                            <td className="p-3 text-emerald-400 font-bold">{soldRevenue.toFixed(0)} ج</td>
                            <td className="p-3 text-blue-400 font-bold">{remainingRevenue.toFixed(0)} ج</td>
                            <td className="p-3 text-green-400 font-black text-lg">{product.profit.toFixed(0)} ج</td>
                          </tr>
                        );
                      })}
                      {/* صف الإجمالي */}
                      <tr className="border-t-2 border-white/20 bg-gradient-to-r from-purple-600/20 to-pink-600/20 font-bold">
                        <td colSpan={2} className="p-3 text-white text-lg">الإجمالي</td>
                        <td className="p-3 text-center text-yellow-300 text-xl">{totals.totalQuantity}</td>
                        <td className="p-3 text-center text-emerald-300 text-xl">{totals.soldQuantity}</td>
                        <td className="p-3 text-center text-blue-300 text-xl">{totals.remainingQuantity}</td>
                        <td colSpan={2}></td>
                        <td className="p-3 text-red-300 text-xl">{totals.totalCost.toFixed(0)} ج</td>
                        <td className="p-3 text-emerald-300 text-xl">{totals.soldRevenue.toFixed(0)} ج</td>
                        <td className="p-3 text-blue-300 text-xl">{totals.remainingRevenue.toFixed(0)} ج</td>
                        <td className="p-3 text-green-300 text-2xl">{totals.totalProfit.toFixed(0)} ج</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">لا توجد بضائع لعرضها</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
