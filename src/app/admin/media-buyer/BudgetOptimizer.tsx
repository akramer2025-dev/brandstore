"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BudgetOptimizer({ campaigns, totalRevenue }: any) {
  const totalBudget = campaigns.reduce((sum: number, c: any) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum: number, c: any) => sum + c.spent, 0);
  
  // Sort campaigns by ROI
  const sortedByROI = [...campaigns].sort((a, b) => b.roi - a.roi);
  const topPerformers = sortedByROI.slice(0, 3);
  const poorPerformers = sortedByROI.filter(c => c.roi < 100 && c.status === "ACTIVE");

  // Budget recommendations
  const budgetRecommendations = sortedByROI.map((campaign: any) => {
    let recommendation = "";
    let action = "";
    let color = "";

    if (campaign.roi >= 200) {
      recommendation = `زِد الميزانية بنسبة 50%`;
      action = "increase";
      color = "green";
    } else if (campaign.roi >= 150) {
      recommendation = `زِد الميزانية بنسبة 25%`;
      action = "increase";
      color = "blue";
    } else if (campaign.roi >= 100) {
      recommendation = `حافظ على الميزانية الحالية`;
      action = "maintain";
      color = "yellow";
    } else if (campaign.roi >= 50) {
      recommendation = `قلل الميزانية بنسبة 30%`;
      action = "decrease";
      color = "orange";
    } else {
      recommendation = `أوقف الحملة فوراً`;
      action = "stop";
      color = "red";
    }

    return {
      ...campaign,
      recommendation,
      action,
      color,
      suggestedBudget: 
        action === "increase" ? campaign.budget * (campaign.roi >= 200 ? 1.5 : 1.25) :
        action === "decrease" ? campaign.budget * 0.7 :
        action === "stop" ? 0 :
        campaign.budget
    };
  });

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle>💰 نظرة عامة على الميزانية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">إجمالي الميزانية</p>
              <p className="text-3xl font-bold text-green-600">{totalBudget.toFixed(0)} ج</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">الإنفاق الفعلي</p>
              <p className="text-3xl font-bold text-blue-600">{totalSpent.toFixed(0)} ج</p>
              <p className="text-xs text-gray-500 mt-1">
                {((totalSpent / totalBudget) * 100).toFixed(0)}% من الميزانية
              </p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">المتبقي</p>
              <p className="text-3xl font-bold text-purple-600">{(totalBudget - totalSpent).toFixed(0)} ج</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers - Increase Budget */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            حملات عالية الأداء - زِد الميزانية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((campaign: any) => {
              const rec = budgetRecommendations.find(r => r.id === campaign.id);
              if (!rec || rec.action !== "increase") return null;

              return (
                <div key={campaign.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{campaign.roi.toFixed(0)}% ROI</p>
                      <p className="text-sm text-gray-600">{campaign.conversions} تحويل</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الميزانية الحالية:</span>
                      <span className="font-bold">{campaign.budget.toFixed(0)} ج</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الميزانية المقترحة:</span>
                      <span className="font-bold text-green-600">{rec.suggestedBudget.toFixed(0)} ج</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-green-700">
                        ✅ {rec.recommendation}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        العائد المتوقع: {(rec.suggestedBudget * (campaign.roi / 100)).toFixed(0)} ج
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Poor Performers - Reduce/Stop */}
      {poorPerformers.length > 0 && (
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              حملات ضعيفة الأداء - قلل أو أوقف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {poorPerformers.map((campaign: any) => {
                const rec = budgetRecommendations.find(r => r.id === campaign.id);
                if (!rec) return null;

                return (
                  <div key={campaign.id} className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{campaign.roi.toFixed(0)}% ROI</p>
                        <p className="text-sm text-gray-600">{campaign.conversions} تحويل</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الإنفاق الحالي:</span>
                        <span className="font-bold">{campaign.spent.toFixed(0)} ج</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>الخسارة:</span>
                        <span className="font-bold text-red-600">
                          {(campaign.spent - (campaign.spent * (campaign.roi / 100))).toFixed(0)} ج
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className={`text-sm font-medium ${rec.action === "stop" ? "text-red-700" : "text-orange-700"}`}>
                          {rec.action === "stop" ? "⛔" : "⚠️"} {rec.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Summary */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            ملخص التحسين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-bold mb-2">📊 توزيع الميزانية المقترح:</h4>
              <div className="space-y-2">
                {budgetRecommendations
                  .filter(r => r.action === "increase")
                  .map((rec: any) => (
                    <div key={rec.id} className="flex justify-between text-sm">
                      <span>{rec.name}</span>
                      <span className="font-bold text-green-600">
                        +{(rec.suggestedBudget - rec.budget).toFixed(0)} ج
                      </span>
                    </div>
                  ))}
                {budgetRecommendations
                  .filter(r => r.action === "decrease" || r.action === "stop")
                  .map((rec: any) => (
                    <div key={rec.id} className="flex justify-between text-sm">
                      <span>{rec.name}</span>
                      <span className="font-bold text-red-600">
                        -{(rec.budget - rec.suggestedBudget).toFixed(0)} ج
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 bg-white/70 rounded-lg">
              <h4 className="font-bold mb-2">💡 التوصية النهائية:</h4>
              <p className="text-sm text-gray-700">
                أعد توزيع الميزانية من الحملات الضعيفة إلى الحملات القوية لتحقيق:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>✅ زيادة متوقعة في الإيرادات: {(totalRevenue * 0.3).toFixed(0)} ج</li>
                <li>✅ تحسين ROAS بنسبة 20-30%</li>
                <li>✅ تقليل الهدر في الإنفاق الإعلاني</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
