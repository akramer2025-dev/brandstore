"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, Zap, Eye, DollarSign, Sparkles, BarChart3, TestTube, Lightbulb } from "lucide-react";
import { MediaBuyerAI } from "./MediaBuyerAI";
import { BudgetOptimizer } from "./BudgetOptimizer";
import { AudienceAnalyzer } from "./AudienceAnalyzer";
import { ABTestManager } from "./ABTestManager";
import { SmartAlerts } from "./SmartAlerts";
import { PerformanceIndicators } from "./PerformanceIndicators";
import { QuickActions } from "./QuickActions";
import { CampaignComparison } from "./CampaignComparison";

export function MediaBuyerTabs({ campaigns, analytics, orders }: any) {
  // Calculate key metrics
  const totalSpent = campaigns.reduce((sum: number, c: any) => sum + c.spent, 0);
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const totalConversions = campaigns.reduce((sum: number, c: any) => sum + c.conversions, 0);
  const totalClicks = campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0);
  const totalImpressions = campaigns.reduce((sum: number, c: any) => sum + c.impressions, 0);
  
  const roas = totalSpent > 0 ? (totalRevenue / totalSpent) : 0;
  const cpa = totalConversions > 0 ? (totalSpent / totalConversions) : 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100) : 0;
  const aov = totalConversions > 0 ? (totalRevenue / totalConversions) : 0;

  const metrics = { roas, cpa, ctr, conversionRate, aov };
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE");

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Here you would implement the actual action logic
    alert(`تنفيذ: ${action}`);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/80 backdrop-blur-sm shadow-xl h-14">
        <TabsTrigger value="overview" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
          <BarChart3 className="w-5 h-5 ml-2" />
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger value="budget" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
          <DollarSign className="w-5 h-5 ml-2" />
          تحسين الميزانية
        </TabsTrigger>
        <TabsTrigger value="audience" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
          <Users className="w-5 h-5 ml-2" />
          تحليل الجمهور
        </TabsTrigger>
        <TabsTrigger value="abtest" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
          <TestTube className="w-5 h-5 ml-2" />
          A/B Testing
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
          <Sparkles className="w-5 h-5 ml-2" />
          AI Advisor
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="space-y-6">
          {/* Smart Alerts */}
          <SmartAlerts campaigns={campaigns} metrics={metrics} />

          {/* Performance Indicators */}
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📊 مؤشرات الأداء
            </h2>
            <PerformanceIndicators metrics={metrics} />
          </div>

          {/* Quick Actions */}
          <QuickActions campaigns={campaigns} onAction={handleQuickAction} />

          {/* Key Performance Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ROAS</p>
                    <p className="text-3xl font-bold text-indigo-600">{roas.toFixed(2)}x</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {roas >= 3 ? "🏆 ممتاز!" : roas >= 2 ? "✅ جيد" : roas >= 1 ? "⚠️ متوسط" : "❌ يحتاج تحسين"}
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPA</p>
                    <p className="text-3xl font-bold text-green-600">{cpa.toFixed(0)} ج</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  تكلفة الاكتساب
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CTR</p>
                    <p className="text-3xl font-bold text-blue-600">{ctr.toFixed(2)}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {ctr >= 5 ? "🏆 ممتاز!" : ctr >= 2 ? "✅ جيد" : "⚠️ يحتاج تحسين"}
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-yellow-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">معدل التحويل</p>
                    <p className="text-3xl font-bold text-orange-600">{conversionRate.toFixed(2)}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {conversionRate >= 5 ? "🏆 ممتاز!" : conversionRate >= 2 ? "✅ جيد" : "⚠️ يحتاج تحسين"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Performance Summary */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>ملخص أداء الحملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">إجمالي الإنفاق</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalSpent.toFixed(0)} ج</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-green-600">{totalRevenue.toFixed(0)} ج</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">الربح الصافي</p>
                  <p className="text-3xl font-bold text-purple-600">{(totalRevenue - totalSpent).toFixed(0)} ج</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">الظهور</p>
                  <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">النقرات</p>
                  <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">التحويلات</p>
                  <p className="text-2xl font-bold">{totalConversions}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">CPC</p>
                  <p className="text-2xl font-bold">{(totalSpent / totalClicks).toFixed(2)} ج</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  توصيات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roas < 2 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">⚠️ ROAS منخفض - راجع الاستهداف والإبداع</p>
                    </div>
                  )}
                  {ctr < 2 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">⚠️ CTR منخفض - حسّن العناوين والصور</p>
                    </div>
                  )}
                  {conversionRate < 2 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">⚠️ معدل تحويل منخفض - حسّن صفحة الهبوط</p>
                    </div>
                  )}
                  {roas >= 3 && ctr >= 3 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">✅ أداء ممتاز! استمر وزد الميزانية</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  فرص التحسين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">جرب Lookalike Audiences</p>
                      <p className="text-sm text-gray-600">استهدف جمهور مشابه لعملائك الحاليين</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">استخدم Dynamic Ads</p>
                      <p className="text-sm text-gray-600">اعرض منتجات محددة حسب اهتمام المستخدم</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">فعّل Retargeting</p>
                      <p className="text-sm text-gray-600">استهدف من زار موقعك ولم يشتري</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Comparison */}
          <CampaignComparison campaigns={campaigns} />
        </div>
      </TabsContent>

      {/* Budget Optimizer Tab */}
      <TabsContent value="budget">
        <BudgetOptimizer campaigns={campaigns} totalRevenue={totalRevenue} />
      </TabsContent>

      {/* Audience Analyzer Tab */}
      <TabsContent value="audience">
        <AudienceAnalyzer campaigns={campaigns} analytics={analytics} orders={orders} />
      </TabsContent>

      {/* A/B Testing Tab */}
      <TabsContent value="abtest">
        <ABTestManager campaigns={campaigns} />
      </TabsContent>

      {/* AI Advisor Tab */}
      <TabsContent value="ai">
        <MediaBuyerAI 
          campaigns={campaigns} 
          analytics={analytics} 
          orders={orders}
          metrics={{ roas, cpa, ctr, conversionRate }}
        />
      </TabsContent>
    </Tabs>
  );
}
