'use client';

import { useEffect, useState } from 'react';
import { Eye, Activity } from 'lucide-react';

interface VisitorStats {
  total: number;
  today: number;
  week: number;
  unique: number;
}

export default function VisitorStatsCard() {
  const [stats, setStats] = useState<VisitorStats | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/visitors/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    }
  };

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/40 backdrop-blur-sm rounded-xl p-4 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/30 rounded-lg">
            <Eye className="w-5 h-5 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-white">زوار المتجر</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-blue-300">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>مباشر</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-lg p-3 text-center border border-blue-400/30">
          <p className="text-blue-200 text-xs mb-1">الإجمالي</p>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-lg p-3 text-center border border-green-400/30">
          <p className="text-green-200 text-xs mb-1">اليوم</p>
          <p className="text-2xl font-black text-white">{stats.today}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-lg p-3 text-center border border-purple-400/30">
          <p className="text-purple-200 text-xs mb-1">الأسبوع</p>
          <p className="text-2xl font-black text-white">{stats.week}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500/30 to-pink-600/30 rounded-lg p-3 text-center border border-pink-400/30">
          <p className="text-pink-200 text-xs mb-1">فريدون</p>
          <p className="text-2xl font-black text-white">{stats.unique}</p>
        </div>
      </div>
    </div>
  );
}
