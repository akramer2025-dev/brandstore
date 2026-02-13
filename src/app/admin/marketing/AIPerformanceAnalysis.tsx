"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Pause, Play, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  recommendation: string;
  action: "INCREASE_BUDGET" | "DECREASE_BUDGET" | "PAUSE" | "KEEP" | "OPTIMIZE";
  reason: string;
}

export function AIPerformanceAnalysis({ language = "ar" }: { language?: "ar" | "en" }) {
  const [performances, setPerformances] = useState<CampaignPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    loadPerformances();
  }, []);

  const loadPerformances = async () => {
    try {
      const res = await fetch("/api/marketing/ai-analyze");
      if (res.ok) {
        const data = await res.json();
        setPerformances(data);
      }
    } catch (error) {
      console.error("Failed to load performances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await fetch("/api/marketing/ai-analyze", {
        method: "POST",
      });
      
      if (res.ok) {
        alert("✅ تم تطبيق التحسينات التلقائية بنجاح!");
        await loadPerformances();
        window.location.reload();
      } else {
        alert("❌ فشل تطبيق التحسينات");
      }
    } catch (error) {
      console.error("Auto-optimization failed:", error);
      alert("❌ حدث خطأ");
    } finally {
      setOptimizing(false);
    }
  };

  const getActionIcon = (action: CampaignPerformance["action"]) => {
    switch (action) {
      case "INCREASE_BUDGET":
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "DECREASE_BUDGET":
        return <TrendingDown className="w-5 h-5 text-orange-400" />;
      case "PAUSE":
        return <Pause className="w-5 h-5 text-red-400" />;
      case "OPTIMIZE":
        return <Sparkles className="w-5 h-5 text-blue-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActionBadge = (action: CampaignPerformance["action"]) => {
    const badges = {
      INCREASE_BUDGET: <Badge className="bg-green-500/20 text-green-300 border-green-500/50">زود الميزانية</Badge>,
      DECREASE_BUDGET: <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">قلل الميزانية</Badge>,
      PAUSE: <Badge className="bg-red-500/20 text-red-300 border-red-500/50">أوقف الحملة</Badge>,
      OPTIMIZE: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">حسّن الحملة</Badge>,
      KEEP: <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50">استمر</Badge>,
    };
    return badges[action];
  };

  const getRoiColor = (roi: number) => {
    if (roi > 200) return "text-green-400";
    if (roi > 100) return "text-green-300";
    if (roi > 0) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            {language === "ar" ? "التحليل الذكي للحملات" : "AI Campaign Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (performances.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            {language === "ar" ? "التحليل الذكي للحملات" : "AI Campaign Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            {language === "ar" ? "لا توجد حملات نشطة للتحليل" : "No active campaigns to analyze"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            {language === "ar" ? "التحليل الذكي للحملات - توصيات AI" : "AI Campaign Analysis & Recommendations"}
          </CardTitle>
          <Button
            onClick={handleAutoOptimize}
            disabled={optimizing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {optimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {language === "ar" ? "جاري التطبيق..." : "Applying..."}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-2" />
                {language === "ar" ? "تطبيق التحسينات تلقائياً" : "Auto-Optimize All"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performances.map((perf) => (
            <div
              key={perf.campaignId}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getActionIcon(perf.action)}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100">{perf.campaignName}</h4>
                    <p className="text-sm text-gray-400">{perf.reason}</p>
                  </div>
                </div>
                {getActionBadge(perf.action)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">{language === "ar" ? "المصروف" : "Spend"}</p>
                  <p className="text-sm font-medium text-gray-200">{perf.spend.toFixed(0)} ج</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{language === "ar" ? "الإيرادات" : "Revenue"}</p>
                  <p className="text-sm font-medium text-gray-200">{perf.revenue.toFixed(0)} ج</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ROI</p>
                  <p className={`text-sm font-bold ${getRoiColor(perf.roi)}`}>
                    {perf.roi > 0 ? "+" : ""}{perf.roi.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{language === "ar" ? "التحويلات" : "Conversions"}</p>
                  <p className="text-sm font-medium text-gray-200">{perf.conversions}</p>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <p className="text-sm text-purple-200">{perf.recommendation}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">{language === "ar" ? "💡 نصيحة ذكية" : "💡 Smart Tip"}:</p>
              <p>
                {language === "ar"
                  ? "الذكاء الاصطناعي يحلل أداء حملاتك كل ساعة ويقترح تحسينات لزيادة الأرباح. اضغط 'تطبيق التحسينات تلقائياً' لتفعيل الأتمتة الكاملة."
                  : "AI analyzes your campaigns hourly and suggests optimizations to maximize profits. Click 'Auto-Optimize All' to enable full automation."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
