'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface MarketingStaff {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  isApproved: boolean;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  iban: string | null;
  instaPay: string | null;
  etisalatCash: string | null;
  vodafoneCash: string | null;
  wePay: string | null;
}

interface Product {
  id: string;
  nameAr: string;
  price: number;
  stock: number;
  soldCount: number;
  importSource: string;
  category: {
    nameAr: string;
  };
}

interface Commission {
  id: string;
  saleAmount: number;
  commissionAmount: number;
  commissionRate: number;
  quantity: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  product: {
    nameAr: string;
  };
  order: {
    id: string;
    status: string;
  };
}

export default function MarketingStaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<MarketingStaff | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalSold: 0,
    totalRevenue: 0,
    estimatedCommission: 0,
  });
  const [commissionsStats, setCommissionsStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    iban: '',
    instaPay: '',
    etisalatCash: '',
    vodafoneCash: '',
    wePay: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'MARKETING_STAFF') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب بيانات الموظف
      const staffResponse = await fetch('/api/marketing-staff');
      const staffData = await staffResponse.json();
      setStaff(staffData.staff);

      // جلب المنتجات
      const productsResponse = await fetch('/api/marketing-staff/products');
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);
      setStats(productsData.stats);

      // جلب العمولات
      const commissionsResponse = await fetch('/api/marketing-staff/commissions');
      const commissionsData = await commissionsResponse.json();
      setCommissions(commissionsData.commissions || []);
      setCommissionsStats(commissionsData.stats);

      // ملء بيانات الدفع الحالية
      if (staffData.staff) {
        setPaymentData({
          bankName: staffData.staff.bankName || '',
          accountNumber: staffData.staff.accountNumber || '',
          accountHolderName: staffData.staff.accountHolderName || '',
          iban: staffData.staff.iban || '',
          instaPay: staffData.staff.instaPay || '',
          etisalatCash: staffData.staff.etisalatCash || '',
          vodafoneCash: staffData.staff.vodafoneCash || '',
          wePay: staffData.staff.wePay || '',
        });
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/marketing-staff/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ تم تحديث طرق الدفع بنجاح');
        setShowPaymentForm(false);
        fetchData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert('❌ حدث خطأ في التحديث');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>حسابك غير مفعّل. يرجى التواصل مع الإدارة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">مرحباً {staff.name} 👋</h1>
          <p className="text-purple-100">لوحة تحكم موظف التسويق</p>
          <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
            <span>📞 {staff.phone}</span>
            {staff.email && <span>✉️ {staff.email}</span>}
            <span className="bg-white/20 px-3 py-1 rounded-full">
              عمولة: {staff.commissionRate}%
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* إجمالي المبيعات */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">إجمالي المبيعات</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {staff.totalSales.toFixed(2)} جنيه
            </p>
          </div>

          {/* إجمالي العمولات */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">إجمالي العمولات</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {staff.totalCommission.toFixed(2)} جنيه
            </p>
          </div>

          {/* العمولات المدفوعة */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">تم صرفها</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {commissionsStats.paidAmount.toFixed(2)} جنيه
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {commissionsStats.paidCount} عملية
            </p>
          </div>

          {/* العمولات المعلقة */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">في الانتظار</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {commissionsStats.unpaidAmount.toFixed(2)} جنيه
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {commissionsStats.unpaidCount} عملية
            </p>
          </div>
        </div>

        {/* Products Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">عدد المنتجات</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">المخزون</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalStock}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">المبيعات</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.totalSold}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">عمولة متوقعة</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.estimatedCommission.toFixed(2)} جنيه
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => router.push('/marketing-staff/add-product')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            ➕ إضافة منتج مستورد
          </button>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            💳 طرق الدفع
          </button>
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">طرق الدفع</h2>
            <form onSubmit={handlePaymentUpdate} className="space-y-4">
              {/* بيانات البنك */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">بيانات البنك</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="اسم البنك"
                    value={paymentData.bankName}
                    onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="رقم الحساب"
                    value={paymentData.accountNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="صاحب الحساب"
                    value={paymentData.accountHolderName}
                    onChange={(e) => setPaymentData({ ...paymentData, accountHolderName: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="IBAN"
                    value={paymentData.iban}
                    onChange={(e) => setPaymentData({ ...paymentData, iban: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* المحافظ الإلكترونية */}
              <div>
                <h3 className="font-semibold mb-2">المحافظ الإلكترونية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="InstaPay"
                    value={paymentData.instaPay}
                    onChange={(e) => setPaymentData({ ...paymentData, instaPay: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Etisalat Cash"
                    value={paymentData.etisalatCash}
                    onChange={(e) => setPaymentData({ ...paymentData, etisalatCash: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Vodafone Cash"
                    value={paymentData.vodafoneCash}
                    onChange={(e) => setPaymentData({ ...paymentData, vodafoneCash: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="WePay"
                    value={paymentData.wePay}
                    onChange={(e) => setPaymentData({ ...paymentData, wePay: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">منتجاتي ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لم تضف أي منتجات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right">المنتج</th>
                    <th className="px-4 py-2 text-right">الفئة</th>
                    <th className="px-4 py-2 text-right">المصدر</th>
                    <th className="px-4 py-2 text-right">السعر</th>
                    <th className="px-4 py-2 text-right">المخزون</th>
                    <th className="px-4 py-2 text-right">المبيعات</th>
                    <th className="px-4 py-2 text-right">العمولة المتوقعة</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{product.nameAr}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.category.nameAr}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {product.importSource}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{product.price} جنيه</td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">{product.soldCount}</td>
                      <td className="px-4 py-3 text-purple-600 font-semibold">
                        {(product.price * product.soldCount * staff.commissionRate / 100).toFixed(2)} جنيه
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">العمولات ({commissions.length})</h2>
          {commissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد عمولات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right">المنتج</th>
                    <th className="px-4 py-2 text-right">الكمية</th>
                    <th className="px-4 py-2 text-right">المبلغ</th>
                    <th className="px-4 py-2 text-right">العمولة</th>
                    <th className="px-4 py-2 text-right">الحالة</th>
                    <th className="px-4 py-2 text-right">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.slice(0, 20).map((commission) => (
                    <tr key={commission.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{commission.product.nameAr}</td>
                      <td className="px-4 py-3">{commission.quantity}</td>
                      <td className="px-4 py-3">{commission.saleAmount.toFixed(2)} جنيه</td>
                      <td className="px-4 py-3 text-purple-600 font-semibold">
                        {commission.commissionAmount.toFixed(2)} جنيه
                      </td>
                      <td className="px-4 py-3">
                        {commission.isPaid ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            ✅ تم الصرف
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            ⏳ معلق
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(commission.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
