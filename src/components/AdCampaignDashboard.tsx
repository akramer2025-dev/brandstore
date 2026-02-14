'use client';

import { useEffect, useState } from 'react';
import { 
  Eye, TrendingUp, Users, ShoppingCart, 
  Monitor, Smartphone, Tablet, Globe,
  Activity, Clock, MapPin, ExternalLink
} from 'lucide-react';

interface VisitorStats {
  summary: {
    total: number;
    today: number;
    week: number;
    month: number;
    unique: number;
    newCustomersToday: number;
    ordersToday: number;
    conversionRate: string;
  };
  devices: Array<{ device: string | null; _count: number }>;
  browsers: Array<{ browser: string | null; _count: number }>;
  referrers: Array<{ referrer: string | null; _count: number }>;
  popularPages: Array<{ page: string | null; _count: number }>;
  recent: Array<{
    id: string;
    page: string | null;
    device: string | null;
    browser: string | null;
    referrer: string | null;
    visitedAt: string;
    ipAddress: string | null;
  }>;
  hourlyData: Array<{ hour: string; count: string }>;
}

export default function AdCampaignDashboard() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // تحديث كل 10 ثواني
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/visitors/detailed-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const { summary, devices, browsers, referrers, popularPages, recent } = stats;

  const getDeviceIcon = (device: string | null) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceColor = (device: string | null) => {
    switch (device) {
      case 'mobile': return 'text-green-400 bg-green-500/20';
      case 'tablet': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">📊 لوحة تحليل الإعلان الممول</h1>
          <p className="text-gray-400">متابعة حية لأداء الحملة الإعلانية</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 px-4 py-2 rounded-lg">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          <span className="text-green-300 font-bold">مباشر</span>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* إجمالي الزوار */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/30 rounded-lg">
              <Eye className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <p className="text-blue-200 text-sm">إجمالي الزوار</p>
              <p className="text-3xl font-black text-white">{summary.total}</p>
            </div>
          </div>
        </div>

        {/* زوار اليوم */}
        <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <p className="text-green-200 text-sm">زوار اليوم</p>
              <p className="text-3xl font-black text-white">{summary.today}</p>
            </div>
          </div>
        </div>

        {/* طلبات اليوم */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/30 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">طلبات اليوم</p>
              <p className="text-3xl font-black text-white">{summary.ordersToday}</p>
            </div>
          </div>
        </div>

        {/* معدل التحويل */}
        <div className="bg-gradient-to-br from-pink-600/20 to-pink-700/20 border border-pink-500/40 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-pink-500/30 rounded-lg">
              <Activity className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <p className="text-pink-200 text-sm">معدل التحويل</p>
              <p className="text-3xl font-black text-white">{summary.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">الأسبوع</p>
          <p className="text-2xl font-bold text-white">{summary.week}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">الشهر</p>
          <p className="text-2xl font-bold text-white">{summary.month}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">زوار فريدون</p>
          <p className="text-2xl font-bold text-white">{summary.unique}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">عملاء جدد</p>
          <p className="text-2xl font-bold text-white">{summary.newCustomersToday}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأجهزة */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            الأجهزة المستخدمة
          </h3>
          <div className="space-y-3">
            {devices.map((item, idx) => {
              const total = devices.reduce((sum, d) => sum + d._count, 0);
              const percentage = ((item._count / total) * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${getDeviceColor(item.device)}`}>
                      {getDeviceIcon(item.device)}
                    </div>
                    <span className="text-white capitalize">{item.device || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-16 text-right">{item._count} ({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* المتصفحات */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            المتصفحات
          </h3>
          <div className="space-y-3">
            {browsers.slice(0, 5).map((item, idx) => {
              const total = browsers.reduce((sum, b) => sum + b._count, 0);
              const percentage = ((item._count / total) * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-white">{item.browser || 'Unknown'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-16 text-right">{item._count} ({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* مصادر الزيارات */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-yellow-400" />
          مصادر الزيارات (أهم 10)
        </h3>
        <div className="space-y-2">
          {referrers.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
              <span className="text-gray-300 text-sm truncate max-w-md">
                {item.referrer || '🔗 زيارة مباشرة'}
              </span>
              <span className="text-white font-bold">{item._count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* الصفحات الأكثر زيارة */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-400" />
          الصفحات الأكثر زيارة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popularPages.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
              <span className="text-gray-300 text-sm">{item.page || '/'}</span>
              <span className="text-white font-bold">{item._count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* آخر الزوار */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          آخر الزوار (مباشر)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right text-gray-400 text-sm py-3 px-4">الوقت</th>
                <th className="text-right text-gray-400 text-sm py-3 px-4">الصفحة</th>
                <th className="text-right text-gray-400 text-sm py-3 px-4">الجهاز</th>
                <th className="text-right text-gray-400 text-sm py-3 px-4">المتصفح</th>
                <th className="text-right text-gray-400 text-sm py-3 px-4">المصدر</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((visitor) => (
                <tr key={visitor.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {new Date(visitor.visitedAt).toLocaleString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </td>
                  <td className="py-3 px-4 text-white text-sm">{visitor.page || '/'}</td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getDeviceColor(visitor.device)}`}>
                      {getDeviceIcon(visitor.device)}
                      <span className="text-xs capitalize">{visitor.device}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{visitor.browser}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs truncate max-w-xs">
                    {visitor.referrer ? (
                      <span title={visitor.referrer}>
                        {visitor.referrer.length > 30 ? visitor.referrer.substring(0, 30) + '...' : visitor.referrer}
                      </span>
                    ) : (
                      '🔗 مباشر'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
