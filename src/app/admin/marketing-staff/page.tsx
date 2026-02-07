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
  createdAt: string;
  _count: {
    products: number;
    commissions: number;
  };
}

interface Commission {
  id: string;
  saleAmount: number;
  commissionAmount: number;
  quantity: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  marketingStaff: {
    name: string;
    phone: string;
  };
  product: {
    nameAr: string;
  };
  order: {
    id: string;
  };
}

export default function AdminMarketingStaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staffList, setStaffList] = useState<MarketingStaff[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب موظفي التسويق
      const staffResponse = await fetch('/api/marketing-staff');
      const staffData = await staffResponse.json();
      setStaffList(staffData.staffList || []);

      // جلب العمولات
      const commissionsResponse = await fetch('/api/marketing-staff/commissions');
      const commissionsData = await commissionsResponse.json();
      setCommissions(commissionsData.commissions || []);
      setStats(commissionsData.stats);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommission = (commissionId: string) => {
    setSelectedCommissions((prev) =>
      prev.includes(commissionId)
        ? prev.filter((id) => id !== commissionId)
        : [...prev, commissionId]
    );
  };

  const handleSelectAll = (paid: boolean) => {
    const filteredCommissions = commissions.filter((c) => c.isPaid === paid);
    setSelectedCommissions(filteredCommissions.map((c) => c.id));
  };

  const handlePayCommissions = async () => {
    if (selectedCommissions.length === 0) {
      alert('❌ يرجى اختيار عمولة واحدة على الأقل');
      return;
    }

    if (!confirm(`هل تريد تسجيل دفع ${selectedCommissions.length} عمولة؟`)) {
      return;
    }

    try {
      const response = await fetch('/api/marketing-staff/commissions/pay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionIds: selectedCommissions,
          paymentMethod,
          paymentReference,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        setSelectedCommissions([]);
        setPaymentMethod('');
        setPaymentReference('');
        fetchData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدفع:', error);
      alert('❌ حدث خطأ في تسجيل الدفع');
    }
  };

  const totalSelected = commissions
    .filter((c) => selectedCommissions.includes(c.id))
    .reduce((sum, c) => sum + c.commissionAmount, 0);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">إدارة موظفي التسويق 👥</h1>
          <p className="text-purple-100">إدارة الموظفين والعمولات والمدفوعات</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">عدد الموظفين</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{staffList.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">إجمالي العمولات</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalAmount.toFixed(2)} جنيه
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.totalAmount > 0 ? `${stats.paidCount + stats.unpaidCount} عملية` : '-'}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">تم صرفها</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.paidAmount.toFixed(2)} جنيه
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.paidCount} عملية</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">معلقة</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {stats.unpaidAmount.toFixed(2)} جنيه
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.unpaidCount} عملية</p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">موظفي التسويق</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right">الاسم</th>
                  <th className="px-4 py-2 text-right">رقم الهاتف</th>
                  <th className="px-4 py-2 text-right">البريد</th>
                  <th className="px-4 py-2 text-right">العمولة</th>
                  <th className="px-4 py-2 text-right">المنتجات</th>
                  <th className="px-4 py-2 text-right">المبيعات</th>
                  <th className="px-4 py-2 text-right">إجمالي العمولة</th>
                  <th className="px-4 py-2 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{staff.name}</td>
                    <td className="px-4 py-3 text-sm">{staff.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{staff.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {staff.commissionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{staff._count.products}</td>
                    <td className="px-4 py-3 font-semibold">{staff.totalSales.toFixed(2)} جنيه</td>
                    <td className="px-4 py-3 text-purple-600 font-semibold">
                      {staff.totalCommission.toFixed(2)} جنيه
                    </td>
                    <td className="px-4 py-3">
                      {staff.isApproved ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          ✅ مفعّل
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          ❌ معلق
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Section */}
        {selectedCommissions.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">
              💳 دفع العمولات المحددة ({selectedCommissions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">اختر الطريقة</option>
                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                  <option value="INSTAPAY">InstaPay</option>
                  <option value="ETISALAT_CASH">Etisalat Cash</option>
                  <option value="VODAFONE_CASH">Vodafone Cash</option>
                  <option value="WEPAY">WePay</option>
                  <option value="CASH">كاش</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم المعاملة (اختياري)</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="رقم التحويل أو المرجع"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handlePayCommissions}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  ✅ تأكيد الدفع ({totalSelected.toFixed(2)} جنيه)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Commissions Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">العمولات ({commissions.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectAll(false)}
                className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-200 transition"
              >
                تحديد المعلقة
              </button>
              <button
                onClick={() => setSelectedCommissions([])}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400 transition"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectAll(false);
                        } else {
                          setSelectedCommissions([]);
                        }
                      }}
                      checked={selectedCommissions.length === commissions.filter((c) => !c.isPaid).length}
                    />
                  </th>
                  <th className="px-4 py-2 text-right">الموظف</th>
                  <th className="px-4 py-2 text-right">المنتج</th>
                  <th className="px-4 py-2 text-right">الكمية</th>
                  <th className="px-4 py-2 text-right">المبلغ</th>
                  <th className="px-4 py-2 text-right">العمولة</th>
                  <th className="px-4 py-2 text-right">الحالة</th>
                  <th className="px-4 py-2 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {!commission.isPaid && (
                        <input
                          type="checkbox"
                          checked={selectedCommissions.includes(commission.id)}
                          onChange={() => handleSelectCommission(commission.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{commission.marketingStaff.name}</p>
                        <p className="text-xs text-gray-500">{commission.marketingStaff.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{commission.product.nameAr}</td>
                    <td className="px-4 py-3">{commission.quantity}</td>
                    <td className="px-4 py-3 font-semibold">{commission.saleAmount.toFixed(2)} جنيه</td>
                    <td className="px-4 py-3 text-purple-600 font-semibold">
                      {commission.commissionAmount.toFixed(2)} جنيه
                    </td>
                    <td className="px-4 py-3">
                      {commission.isPaid ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          ✅ مدفوع
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
        </div>
      </div>
    </div>
  );
}
