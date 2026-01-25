"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, Trophy, Target } from "lucide-react";

interface CampaignComparisonProps {
  campaigns: any[];
}

export function CampaignComparison({ campaigns }: CampaignComparisonProps) {
  // Sort campaigns by ROI
  const sortedCampaigns = [...campaigns]
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  const getROIColor = (roi: number) => {
    if (roi >= 200) return "text-green-600";
    if (roi >= 100) return "text-blue-600";
    if (roi >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getROIBg = (roi: number) => {
    if (roi >= 200) return "bg-green-50 border-green-200";
    if (roi >= 100) return "bg-blue-50 border-blue-200";
    if (roi >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getStatusIcon = (roi: number) => {
    if (roi >= 200) return <ArrowUp className="w-5 h-5 text-green-600" />;
    if (roi >= 100) return <Minus className="w-5 h-5 text-blue-600" />;
    return <ArrowDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          مقارنة الحملات (أفضل 5)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedCampaigns.map((campaign, index) => {
            const ctr = campaign.impressions > 0 
              ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
              : "0.00";
            const convRate = campaign.clicks > 0
              ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
              : "0.00";
            const cpa = campaign.conversions > 0
              ? (campaign.spent / campaign.conversions).toFixed(0)
              : "0";

            return (
              <div
                key={campaign.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${getROIBg(campaign.roi)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {index === 0 && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {index > 0 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="font-bold text-gray-600">#{index + 1}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg">{campaign.name}</h4>
                      <p className="text-xs text-gray-600">{campaign.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(campaign.roi)}
                    <span className={`text-2xl font-bold ${getROIColor(campaign.roi)}`}>
                      {campaign.roi}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-white/50 rounded">
                    <p className="text-xs text-gray-600 mb-1">الإنفاق</p>
                    <p className="font-bold text-sm">{campaign.spent.toLocaleString('en-US')} ج</p>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <p className="text-xs text-gray-600 mb-1">CTR</p>
                    <p className="font-bold text-sm">{ctr}%</p>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <p className="text-xs text-gray-600 mb-1">CPA</p>
                    <p className="font-bold text-sm">{cpa} ج</p>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <p className="text-xs text-gray-600 mb-1">التحويل</p>
                    <p className="font-bold text-sm">{convRate}%</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-3 p-2 bg-white/70 rounded text-xs">
                  <p className="font-medium">
                    {campaign.roi >= 200
                      ? "🚀 حملة رابحة - زِد الميزانية 30-50%"
                      : campaign.roi >= 100
                      ? "✅ أداء جيد - اختبر creatives جديدة للتحسين"
                      : campaign.roi >= 50
                      ? "⚠️ يحتاج تحسين - راجع الاستهداف والعروض"
                      : "❌ أوقف الحملة فوراً أو غير الاستراتيجية بالكامل"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {sortedCampaigns.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد حملات للمقارنة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
