"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Lightbulb, TrendingUp, Search, Target, Zap, MessageSquare, Loader2 } from "lucide-react";

export function AIAssistant({ campaigns, keywords, analytics }: any) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAIAnalysis = async (type: string) => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/marketing/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, campaigns, keywords, analytics }),
      });

      const data = await res.json();
      setResponse(data.analysis || data.error);
    } catch (error) {
      setResponse("حدث خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/marketing/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, campaigns, keywords, analytics }),
      });

      const data = await res.json();
      setResponse(data.response || data.error);
    } catch (error) {
      setResponse("حدث خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: TrendingUp,
      label: "تحليل أداء الحملات",
      color: "from-blue-600 to-indigo-600",
      type: "campaign_analysis",
      description: "احصل على تحليل شامل لأداء جميع حملاتك التسويقية",
    },
    {
      icon: Search,
      label: "اقتراحات SEO",
      color: "from-green-600 to-emerald-600",
      type: "seo_suggestions",
      description: "اقتراحات لتحسين كلماتك المفتاحية وترتيب موقعك",
    },
    {
      icon: Target,
      label: "تحسين الحملات",
      color: "from-purple-600 to-pink-600",
      type: "campaign_optimization",
      description: "نصائح لتحسين ROI والحصول على نتائج أفضل",
    },
    {
      icon: Lightbulb,
      label: "أفكار حملات جديدة",
      color: "from-orange-600 to-yellow-600",
      type: "campaign_ideas",
      description: "أفكار إبداعية لحملات تسويقية جديدة",
    },
    {
      icon: MessageSquare,
      label: "تحسين نصوص الإعلانات",
      color: "from-pink-600 to-rose-600",
      type: "ad_copy_improvement",
      description: "اقتراحات لجعل نصوص إعلاناتك أكثر جاذبية",
    },
    {
      icon: Zap,
      label: "تحليل المنافسين",
      color: "from-teal-600 to-cyan-600",
      type: "competitor_analysis",
      description: "استراتيجيات للتفوق على منافسيك",
    },
  ];

  // Auto-insights
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  const avgROI = campaigns.length > 0 
    ? campaigns.reduce((sum: number, c: any) => sum + c.roi, 0) / campaigns.length 
    : 0;
  const totalSpent = campaigns.reduce((sum: number, c: any) => sum + c.spent, 0);
  const totalBudget = campaigns.reduce((sum: number, c: any) => sum + c.budget, 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats & AI Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">متوسط ROI</p>
                <p className="text-3xl font-bold text-blue-600">{avgROI.toFixed(0)}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {avgROI > 150 ? "✨ أداء ممتاز! استمر" : avgROI > 100 ? "✅ أداء جيد" : "⚠️ يحتاج تحسين"}
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
                <p className="text-sm text-gray-600">الحملات النشطة</p>
                <p className="text-3xl font-bold text-green-600">{activeCampaigns}/{totalCampaigns}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {activeCampaigns === 0 ? "⚠️ لا توجد حملات نشطة" : "✅ حملات جارية"}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">استخدام الميزانية</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {totalSpent} من {totalBudget} ج
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-600" />
            إجراءات سريعة بالذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.type}
                onClick={() => handleAIAnalysis(action.type)}
                disabled={loading}
                className={`h-auto py-4 px-6 bg-gradient-to-r ${action.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex flex-col items-start gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <action.icon className="w-5 h-5" />
                    <span className="font-semibold">{action.label}</span>
                  </div>
                  <p className="text-xs text-white/90 text-right">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Query */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            اسأل الذكاء الاصطناعي أي شيء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="مثال: كيف يمكنني زيادة معدل التحويل في حملاتي؟"
              rows={3}
              className="text-lg"
            />
            <Button
              onClick={handleCustomQuery}
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ml-2" />
                  اسأل الذكاء الاصطناعي
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Response */}
      {response && (
        <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-600" />
              تحليل الذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {response}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
