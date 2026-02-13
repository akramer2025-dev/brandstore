"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Search, TrendingUp, Eye, MousePointer, DollarSign, Sparkles, Target, Zap, LineChart, PieChart, AlertCircle, CheckCircle, Clock, TrendingDown } from "lucide-react";
import { AddCampaignButton, AddKeywordButton } from "./MarketingActions";
import { AIAssistant } from "./AIAssistant";
import { CampaignChart } from "./CampaignChart";
import { AIPerformanceAnalysis } from "./AIPerformanceAnalysis";
import { FacebookIntegration } from "./FacebookIntegration";
import { SyncAllFacebook } from "./SyncAllFacebook";
import { FacebookCredentialsTest } from "./FacebookCredentialsTest";

const translations = {
  ar: {
    overview: "نظرة عامة",
    campaigns: "الحملات",
    seo: "الـ SEO",
    aiAssistant: "مساعد AI",
    activeCampaigns: "حملات نشطة",
    totalBudget: "إجمالي الميزانية",
    totalClicks: "إجمالي النقرات",
    conversions: "التحويلات",
    conversion: "تحويل",
    websiteStats: "إحصائيات الموقع - اليوم",
    pageViews: "مشاهدات الصفحة",
    uniqueVisitors: "زوار فريدون",
    bounceRate: "معدل الارتداد",
    revenue: "الإيرادات",
    topPerformingCampaigns: "أفضل الحملات أداءً",
    needsImprovement: "تحتاج إلى تحسين",
    marketingCampaigns: "الحملات التسويقية",
    totalCampaigns: "إجمالي الحملات",
    active: "نشطة",
    paused: "متوقف",
    completed: "مكتمل",
    draft: "مسودة",
    budgetUsed: "الميزانية المستخدمة",
    impressions: "الظهور",
    clicks: "النقرات",
    noCampaigns: "لا توجد حملات",
    createFirstCampaign: "ابدأ بإنشاء حملة تسويقية جديدة",
    seoKeywords: "كلمات الـ SEO",
    totalKeywords: "إجمالي الكلمات",
    keyword: "الكلمة المفتاحية",
    searchVolume: "حجم البحث",
    difficulty: "الصعوبة",
    currentRank: "الترتيب الحالي",
    targetRank: "الترتيب المستهدف",
    status: "الحالة",
    noKeywords: "لا توجد كلمات مفتاحية",
    addSeoKeywords: "ابدأ بإضافة كلمات SEO لمتابعتها",
    egp: "ج",
  },
  en: {
    overview: "Overview",
    campaigns: "Campaigns",
    seo: "SEO",
    aiAssistant: "AI Assistant",
    activeCampaigns: "Active Campaigns",
    totalBudget: "Total Budget",
    totalClicks: "Total Clicks",
    conversions: "Conversions",
    conversion: "Conversion",
    websiteStats: "Website Stats - Today",
    pageViews: "Page Views",
    uniqueVisitors: "Unique Visitors",
    bounceRate: "Bounce Rate",
    revenue: "Revenue",
    topPerformingCampaigns: "Top Performing Campaigns",
    needsImprovement: "Needs Improvement",
    marketingCampaigns: "Marketing Campaigns",
    totalCampaigns: "Total Campaigns",
    active: "Active",
    paused: "Paused",
    completed: "Completed",
    draft: "Draft",
    budgetUsed: "Budget Used",
    impressions: "Impressions",
    clicks: "Clicks",
    noCampaigns: "No Campaigns",
    createFirstCampaign: "Start by creating a new marketing campaign",
    seoKeywords: "SEO Keywords",
    totalKeywords: "Total Keywords",
    keyword: "Keyword",
    searchVolume: "Search Volume",
    difficulty: "Difficulty",
    currentRank: "Current Rank",
    targetRank: "Target Rank",
    status: "Status",
    noKeywords: "No Keywords",
    addSeoKeywords: "Start by adding SEO keywords to track",
    egp: "EGP",
  },
};

export function MarketingTabs({ campaigns, keywords, analytics, language = "ar" }: any) {
  const t = translations[language as "ar" | "en"];
  
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

  const getStatusText = (status: string) => {
    const statusMap: any = {
      ACTIVE: t.active,
      PAUSED: t.paused,
      COMPLETED: t.completed,
      DRAFT: t.draft,
    };
    return statusMap[status] || status;
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-800/90 backdrop-blur-sm shadow-xl h-14 border border-gray-700">
        <TabsTrigger value="overview" className="text-lg text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
          <BarChart3 className="w-5 h-5 ml-2" />
          {t.overview}
        </TabsTrigger>
        <TabsTrigger value="campaigns" className="text-lg text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
          <TrendingUp className="w-5 h-5 ml-2" />
          {t.campaigns}
        </TabsTrigger>
        <TabsTrigger value="seo" className="text-lg text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
          <Search className="w-5 h-5 ml-2" />
          {t.seo}
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-lg text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
          <Sparkles className="w-5 h-5 ml-2" />
          {t.aiAssistant}
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="space-y-6">
          {/* Marketing Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{t.activeCampaigns}</p>
                    <p className="text-3xl font-bold text-purple-400">{activeCampaigns}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{t.totalBudget}</p>
                    <p className="text-3xl font-bold text-blue-400">{totalBudget.toFixed(0)} {t.egp}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{t.totalClicks}</p>
                    <p className="text-3xl font-bold text-green-400">{totalClicks}</p>
                  </div>
                  <MousePointer className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{t.conversions}</p>
                    <p className="text-3xl font-bold text-orange-400">{totalConversions}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Website Analytics */}
          <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-100">{t.websiteStats}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.pageViews}</p>
                  <p className="text-2xl font-bold text-purple-400">{latestAnalytics.pageViews}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.uniqueVisitors}</p>
                  <p className="text-2xl font-bold text-blue-400">{latestAnalytics.uniqueVisitors}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.bounceRate}</p>
                  <p className="text-2xl font-bold text-orange-400">{latestAnalytics.bounceRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.conversions}</p>
                  <p className="text-2xl font-bold text-green-400">{latestAnalytics.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t.revenue}</p>
                  <p className="text-2xl font-bold text-teal-400">{latestAnalytics.revenue} {t.egp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Performance Analysis - التحليل الذكي */}
          <AIPerformanceAnalysis language={language} />

          {/* Facebook Credentials Test - اختبار اتصال فيسبوك */}
          <FacebookCredentialsTest />

          {/* Facebook Sync - مزامنة فيسبوك */}
          <SyncAllFacebook language={language} />

          {/* Performance Chart */}
          <CampaignChart campaigns={campaigns} analytics={analytics} />

          {/* Quick Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">
                  <Target className="w-5 h-5 text-green-400" />
                  {t.topPerformingCampaigns}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns
                  .sort((a: any, b: any) => b.roi - a.roi)
                  .slice(0, 3)
                  .map((campaign: any, index: number) => (
                    <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-200">{campaign.name}</p>
                          <p className="text-sm text-gray-400">{campaign.platform}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{campaign.roi.toFixed(0)}% ROI</p>
                        <p className="text-sm text-gray-400">{campaign.conversions} {t.conversion}</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  {t.needsImprovement}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns
                  .filter((c: any) => c.status === "ACTIVE" && c.roi < 100)
                  .slice(0, 3)
                  .map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div>
                        <p className="font-semibold text-gray-200">{campaign.name}</p>
                        <p className="text-sm text-gray-400">{campaign.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-400">{campaign.roi.toFixed(0)}% ROI</p>
                        <p className="text-sm text-gray-400">CTR: {campaign.ctr.toFixed(2)}%</p>
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
            <h2 className="text-2xl font-bold text-gray-100">{t.marketingCampaigns}</h2>
            <p className="text-gray-400">
              {t.totalCampaigns}: {campaigns.length} | {t.active}: {activeCampaigns}
            </p>
          </div>
          <AddCampaignButton />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {campaigns.map((campaign: any) => {
            const remainingBudget = campaign.budget - campaign.spent;
            const budgetPercentage = (campaign.spent / campaign.budget) * 100;

            return (
              <Card key={campaign.id} className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-100">{campaign.name}</CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        campaign.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "PAUSED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {getStatusText(campaign.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {campaign.types && Array.isArray(campaign.types) ? (
                      campaign.types.map((type: string) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                        >
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {campaign.type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{campaign.platform}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">{t.budgetUsed}</span>
                        <span className="font-bold text-gray-200">{campaign.spent} / {campaign.budget} {t.egp}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full"
                          style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <div>
                        <p className="text-xs text-gray-400">{t.impressions}</p>
                        <p className="text-lg font-bold text-gray-200">{campaign.impressions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t.clicks}</p>
                        <p className="text-lg font-bold text-gray-200">{campaign.clicks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t.conversions}</p>
                        <p className="text-lg font-bold text-gray-200">{campaign.conversions}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">CTR:</span>{" "}
                        <span className="font-bold text-gray-200">{campaign.ctr.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">CPC:</span>{" "}
                        <span className="font-bold text-gray-200">{campaign.cpc.toFixed(2)} {t.egp}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">ROI:</span>{" "}
                        <span className="font-bold text-gray-200">{campaign.roi.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Facebook Integration */}
                    <div className="pt-3 border-t border-gray-700">
                      <FacebookIntegration
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                        campaignDescription={campaign.adCopy || undefined}
                        campaignBudget={campaign.budget}
                        facebookCampaignId={campaign.facebookCampaignId}
                        language={language}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold mb-2 text-gray-200">{t.noCampaigns}</h3>
              <p className="text-gray-400 mb-4">{t.createFirstCampaign}</p>
              <AddCampaignButton />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* SEO Tab */}
      <TabsContent value="seo">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">{t.seoKeywords}</h2>
            <p className="text-gray-400">{t.totalKeywords}: {keywords.length}</p>
          </div>
          <AddKeywordButton />
        </div>

        <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-700">
                    <th className="text-right py-3 px-4 text-gray-300">{t.keyword}</th>
                    <th className="text-right py-3 px-4 text-gray-300">{t.searchVolume}</th>
                    <th className="text-right py-3 px-4 text-gray-300">{t.difficulty}</th>
                    <th className="text-right py-3 px-4 text-gray-300">{t.currentRank}</th>
                    <th className="text-right py-3 px-4 text-gray-300">{t.targetRank}</th>
                    <th className="text-right py-3 px-4 text-gray-300">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((keyword: any) => (
                    <tr key={keyword.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-200">{keyword.keyword}</td>
                      <td className="py-3 px-4 text-gray-300">{keyword.searchVolume?.toLocaleString() || "-"}</td>
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
                      <td className="py-3 px-4 text-gray-300">{keyword.currentRank || "-"}</td>
                      <td className="py-3 px-4 text-gray-300">{keyword.targetRank || "-"}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{keyword.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {keywords.length === 0 && (
          <Card className="backdrop-blur-sm bg-gray-800/90 border-gray-700 shadow-xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold mb-2 text-gray-200">{t.noKeywords}</h3>
              <p className="text-gray-400 mb-4">{t.addSeoKeywords}</p>
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
