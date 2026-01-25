"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  Pause, 
  TrendingUp, 
  Target, 
  Zap, 
  RefreshCw,
  DollarSign,
  Users,
  Eye,
  TestTube
} from "lucide-react";

interface QuickActionsProps {
  campaigns: any[];
  onAction: (action: string) => void;
}

export function QuickActions({ campaigns, onAction }: QuickActionsProps) {
  const topCampaign = campaigns.reduce((best: any, c: any) => 
    c.roi > (best?.roi || 0) ? c : best, null
  );

  const losingCampaigns = campaigns.filter(c => c.roi < 50);
  const scalableCampaigns = campaigns.filter(c => c.roi >= 200);
  const testingNeeded = campaigns.filter(c => c.clicks > 1000 && c.conversions < 10);

  const actions = [
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Scale أفضل حملة",
      description: topCampaign ? `${topCampaign.name} (ROI: ${topCampaign.roi}%)` : "لا توجد حملات",
      action: "scale-top",
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      available: scalableCampaigns.length > 0
    },
    {
      icon: <Pause className="w-6 h-6" />,
      title: "أوقف الحملات الخاسرة",
      description: `${losingCampaigns.length} حملات بـ ROI < 50%`,
      action: "stop-losing",
      color: "bg-gradient-to-r from-red-500 to-rose-600",
      available: losingCampaigns.length > 0
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "تحسين CPA",
      description: "خفض تكلفة الاكتساب 30%",
      action: "optimize-cpa",
      color: "bg-gradient-to-r from-blue-500 to-cyan-600",
      available: true
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "توسيع الجمهور",
      description: "LAL 1% → 2-3%",
      action: "expand-audience",
      color: "bg-gradient-to-r from-purple-500 to-pink-600",
      available: campaigns.length > 0
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Auto-Optimization",
      description: "تحسين تلقائي لكل الحملات",
      action: "auto-optimize",
      color: "bg-gradient-to-r from-yellow-500 to-orange-600",
      available: true
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "تحديث الكرييتف",
      description: "غير الإعلانات القديمة",
      action: "refresh-creative",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600",
      available: campaigns.length > 0
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "إعادة توزيع الميزانية",
      description: "تخصيص ذكي للميزانية",
      action: "rebalance-budget",
      color: "bg-gradient-to-r from-teal-500 to-green-600",
      available: campaigns.length > 0
    },
    {
      icon: <TestTube className="w-6 h-6" />,
      title: "إنشاء A/B Test",
      description: `${testingNeeded.length} حملة تحتاج اختبار`,
      action: "create-test",
      color: "bg-gradient-to-r from-pink-500 to-rose-600",
      available: testingNeeded.length > 0
    }
  ];

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold">إجراءات سريعة</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.available && onAction(action.action)}
              disabled={!action.available}
              className={`group relative overflow-hidden rounded-xl p-5 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${action.color}`}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="mb-3 transform group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <h4 className="font-bold text-sm mb-1 text-right">{action.title}</h4>
                <p className="text-xs opacity-90 text-right">{action.description}</p>
              </div>

              {!action.available && (
                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                  <span className="text-xs font-bold">غير متاح</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-indigo-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-indigo-900 mb-1">💡 نصيحة ذكية</h4>
              <p className="text-sm text-indigo-700">
                {scalableCampaigns.length > 0 
                  ? `لديك ${scalableCampaigns.length} حملات جاهزة للـ Scaling - زِد ميزانيتهم تدريجياً!`
                  : losingCampaigns.length > 0
                  ? `أوقف ${losingCampaigns.length} حملات خاسرة فوراً واستثمر في Retargeting`
                  : testingNeeded.length > 0
                  ? `${testingNeeded.length} حملات بـ CTR منخفض - جرب creatives جديدة`
                  : "حملاتك تعمل بشكل جيد! استمر في المراقبة والتحسين"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
