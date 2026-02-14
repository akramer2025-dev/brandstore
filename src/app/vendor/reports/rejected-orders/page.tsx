'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { XCircle, Calendar, DollarSign, TrendingDown, FileText } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface RejectedOrder {
  id: string;
  orderId: string;
  rejectedBy: string;
  rejectedByRole: string;
  rejectionReason: string;
  orderValue: number;
  vendorId: string | null;
  createdAt: string;
}

interface Statistics {
  totalRejected: number;
  totalValue: number;
  reasonsCount: Record<string, number>;
  vendorStats: Record<string, { count: number; totalValue: number }> | null;
}

export default function RejectedOrdersReport() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [rejectedOrders, setRejectedOrders] = useState<RejectedOrder[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role && !['VENDOR', 'ADMIN', 'DEVELOPER'].includes(session.user.role)) {
      router.push('/');
      return;
    }

    fetchReport();
  }, [status, session, startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = '/api/reports/rejected-orders';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRejectedOrders(data.data.rejectedOrders);
        setStatistics(data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching rejected orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التقرير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BackButton fallbackUrl="/vendor/reports" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <XCircle className="w-10 h-10 text-red-600" />
            تقرير الطلبات المرفوضة
          </h1>
          <p className="text-gray-600">
            {session?.user?.role === 'DEVELOPER' ? 'جميع الطلبات المرفوضة في النظام' : 'الطلبات المرفوضة الخاصة بك'}
          </p>
        </div>

        {/* الفلاتر */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            فلترة حسب التاريخ
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReport}
                className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                تطبيق الفلتر
              </button>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        {statistics && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">إجمالي الطلبات المرفوضة</p>
                  <p className="text-3xl font-bold text-red-600">{statistics.totalRejected}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">إجمالي القيمة المفقودة</p>
                  <p className="text-3xl font-bold text-orange-600">{statistics.totalValue.toFixed(2)} جنيه</p>
                </div>
                <DollarSign className="w-12 h-12 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">متوسط قيمة الطلب المرفوض</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statistics.totalRejected > 0 
                      ? (statistics.totalValue / statistics.totalRejected).toFixed(2) 
                      : '0'} جنيه
                  </p>
                </div>
                <TrendingDown className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* أسباب الرفض */}
        {statistics && Object.keys(statistics.reasonsCount).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              أسباب الرفض
            </h2>
            <div className="space-y-3">
              {Object.entries(statistics.reasonsCount)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{reason}</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {count} طلب
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* قائمة الطلبات المرفوضة */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">سجل الطلبات المرفوضة</h2>
          
          {rejectedOrders.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد طلبات مرفوضة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      قيمة الطلب
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      سبب الرفض
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تم الرفض بواسطة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rejectedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderValue.toFixed(2)} جنيه
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {order.rejectionReason}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.rejectedByRole === 'VENDOR' ? 'bg-blue-100 text-blue-800' :
                          order.rejectedByRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.rejectedByRole === 'VENDOR' ? 'شريك' :
                           order.rejectedByRole === 'ADMIN' ? 'أدمن' : 'مطور'}
                        </span>
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
