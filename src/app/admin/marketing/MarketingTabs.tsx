"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Search, TrendingUp, Eye, MousePointer, DollarSign, Sparkles, Target, Zap, LineChart, PieChart, AlertCircle, CheckCircle, Clock, TrendingDown } from "lucide-react";
import { AddCampaignButton, AddKeywordButton } from "./MarketingActions";
import { AIAssistant } from "./AIAssistant";
import { CampaignChart } from "./CampaignChart";

export function MarketingTabs({ campaigns, keywords, analytics }: any) {
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  const totalBudget = campaigns.reduce((sum: number, c: any) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum: number, c: any) => sum + c.spent, 0);
  const totalClicks = campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum: number, c: any) => sum + c.conversions, 0);

  const latestAnalytics = analytics[0] || {
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    conversions: 0,
    revenue: 0,
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm shadow-xl h-14">
        <TabsTrigger value="overview" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
          <BarChart3 className="w-5 h-5 ml-2" />
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger value="campaigns" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
          <TrendingUp className="w-5 h-5 ml-2" />
          الحملات
        </TabsTrigger>
        <TabsTrigger value="seo" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
          <Search className="w-5 h-5 ml-2" />
          الـ SEO
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
          <Sparkles className="w-5 h-5 ml-2" />
          مساعد AI
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="space-y-6">
          {/* Marketing Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">حملات نشطة</p>
                    <p className="text-3xl font-bold text-purple-600">{activeCampaigns}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">إجمالي الميزانية</p>
                    <p className="text-3xl font-bold text-blue-600">{totalBudget.toFixed(0)} ج</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">إجمالي النقرات</p>
                    <p className="text-3xl font-bold text-green-600">{totalClicks}</p>
                  </div>
                  <MousePointer className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">التحويلات</p>
                    <p className="text-3xl font-bold text-orange-600">{totalConversions}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Website Analytics */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>إحصائيات الموقع - اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">مشاهدات الصفحة</p>
                  <p className="text-2xl font-bold text-purple-600">{latestAnalytics.pageViews}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">زوار فريدون</p>
                  <p className="text-2xl font-bold text-blue-600">{latestAnalytics.uniqueVisitors}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">معدل الارتداد</p>
                  <p className="text-2xl font-bold text-orange-600">{latestAnalytics.bounceRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">التحويلات</p>
                  <p className="text-2xl font-bold text-green-600">{latestAnalytics.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">الإيرادات</p>
                  <p className="text-2xl font-bold text-teal-600">{latestAnalytics.revenue} ج</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <CampaignChart campaigns={campaigns} analytics={analytics} />

          {/* Quick Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  أفضل الحملات أداءً
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns
                  .sort((a: any, b: any) => b.roi - a.roi)
                  .slice(0, 3)
                  .map((campaign: any, index: number) => (
                    <div key={campaign.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.platform}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{campaign.roi.toFixed(0)}% ROI</p>
                        <p className="text-sm text-gray-500">{campaign.conversions} تحويل</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  تحتاج إلى تحسين
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns
                  .filter((c: any) => c.status === "ACTIVE" && c.roi < 100)
                  .slice(0, 3)
                  .map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-semibold">{campaign.name}</p>
                        <p className="text-sm text-gray-500">{campaign.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{campaign.roi.toFixed(0)}% ROI</p>
                        <p className="text-sm text-gray-500">CTR: {campaign.ctr.toFixed(2)}%</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Campaigns Tab */}
      <TabsContent value="campaigns">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">الحملات التسويقية</h2>
            <p className="text-gray-600">
              إجمالي الحملات: {campaigns.length} | نشطة: {activeCampaigns}
            </p>
          </div>
          <AddCampaignButton />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {campaigns.map((campaign: any) => {
            const remainingBudget = campaign.budget - campaign.spent;
            const budgetPercentage = (campaign.spent / campaign.budget) * 100;

            return (
              <Card key={campaign.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        campaign.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "PAUSED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {campaign.status === "ACTIVE" && "نشط"}
                      {campaign.status === "PAUSED" && "متوقف"}
                      {campaign.status === "COMPLETED" && "مكتمل"}
                      {campaign.status === "DRAFT" && "مسودة"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{campaign.type} • {campaign.platform}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">الميزانية المستخدمة</span>
                        <span className="font-bold">{campaign.spent} / {campaign.budget} ج</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full"
                          style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">الظهور</p>
                        <p className="text-lg font-bold">{campaign.impressions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">النقرات</p>
                        <p className="text-lg font-bold">{campaign.clicks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">التحويلات</p>
                        <p className="text-lg font-bold">{campaign.conversions}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CTR:</span>{" "}
                        <span className="font-bold">{campaign.ctr.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CPC:</span>{" "}
                        <span className="font-bold">{campaign.cpc.toFixed(2)} ج</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ROI:</span>{" "}
                        <span className="font-bold">{campaign.roi.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد حملات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإنشاء حملة تسويقية جديدة</p>
              <AddCampaignButton />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* SEO Tab */}
      <TabsContent value="seo">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">كلمات الـ SEO</h2>
            <p className="text-gray-600">إجمالي الكلمات: {keywords.length}</p>
          </div>
          <AddKeywordButton />
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right py-3 px-4">الكلمة المفتاحية</th>
                    <th className="text-right py-3 px-4">حجم البحث</th>
                    <th className="text-right py-3 px-4">الصعوبة</th>
                    <th className="text-right py-3 px-4">الترتيب الحالي</th>
                    <th className="text-right py-3 px-4">الترتيب المستهدف</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((keyword: any) => (
                    <tr key={keyword.id} className="border-b hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold">{keyword.keyword}</td>
                      <td className="py-3 px-4">{keyword.searchVolume?.toLocaleString() || "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            keyword.difficulty >= 70
                              ? "bg-red-100 text-red-700"
                              : keyword.difficulty >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {keyword.difficulty || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{keyword.currentRank || "-"}</td>
                      <td className="py-3 px-4">{keyword.targetRank || "-"}</td>
                      <td className="py-3 px-4 text-sm">{keyword.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {keywords.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد كلمات مفتاحية</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة كلمات SEO لمتابعتها</p>
              <AddKeywordButton />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* AI Assistant Tab */}
      <TabsContent value="ai">
        <AIAssistant campaigns={campaigns} keywords={keywords} analytics={analytics} />
      </TabsContent>
    </Tabs>
  );
}
