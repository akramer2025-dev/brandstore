"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Zap, TrendingUp, Target, DollarSign, Users, Loader2 } from "lucide-react";

export function MediaBuyerAI({ campaigns, analytics, orders, metrics }: any) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAIAnalysis = async (type: string) => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/media-buyer/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, campaigns, analytics, orders, metrics }),
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
      const res = await fetch("/api/media-buyer/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, campaigns, analytics, orders, metrics }),
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
      icon: DollarSign,
      label: "تحسين ROAS",
      color: "from-green-600 to-emerald-600",
      type: "optimize_roas",
      description: "استراتيجيات لزيادة العائد على الإنفاق الإعلاني",
    },
    {
      icon: Target,
      label: "تقليل CPA",
      color: "from-blue-600 to-cyan-600",
      type: "reduce_cpa",
      description: "طرق لتقليل تكلفة اكتساب العميل",
    },
    {
      icon: TrendingUp,
      label: "زيادة معدل التحويل",
      color: "from-purple-600 to-pink-600",
      type: "increase_conversion",
      description: "تحسين معدل التحويل من زائر إلى عميل",
    },
    {
      icon: Users,
      label: "استهداف أفضل",
      color: "from-indigo-600 to-purple-600",
      type: "better_targeting",
      description: "اقتراحات لتحسين استهداف الجمهور",
    },
    {
      icon: Zap,
      label: "تحليل الكرييتف",
      color: "from-orange-600 to-yellow-600",
      type: "creative_analysis",
      description: "تحليل التصاميم والنصوص الإعلانية",
    },
    {
      icon: Sparkles,
      label: "خطة scaling",
      color: "from-pink-600 to-rose-600",
      type: "scaling_plan",
      description: "استراتيجية زيادة الحملات الناجحة",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Performance Summary */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-xl">
        <CardHeader>
          <CardTitle>📊 تقييم الأداء الحالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ROAS</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.roas.toFixed(2)}x</p>
              <p className="text-xs mt-1">
                {metrics.roas >= 3 ? "🏆 ممتاز" : metrics.roas >= 2 ? "✅ جيد" : "⚠️ يحتاج تحسين"}
              </p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">CPA</p>
              <p className="text-2xl font-bold text-green-600">{metrics.cpa.toFixed(0)} ج</p>
              <p className="text-xs mt-1">تكلفة الاكتساب</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">CTR</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.ctr.toFixed(2)}%</p>
              <p className="text-xs mt-1">
                {metrics.ctr >= 5 ? "🏆 ممتاز" : metrics.ctr >= 2 ? "✅ جيد" : "⚠️ منخفض"}
              </p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">معدل التحويل</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.conversionRate.toFixed(2)}%</p>
              <p className="text-xs mt-1">
                {metrics.conversionRate >= 5 ? "🏆 ممتاز" : metrics.conversionRate >= 2 ? "✅ جيد" : "⚠️ منخفض"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick AI Actions */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            تحليلات واقتراحات بالذكاء الاصطناعي
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
            <Zap className="w-6 h-6 text-orange-600" />
            اسأل Media Buyer AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="مثال: كيف أحسن ROAS لحملاتي؟ أو ما أفضل وقت لنشر الإعلانات؟"
              rows={3}
              className="text-lg"
            />
            <Button
              onClick={handleCustomQuery}
              disabled={loading || !query.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ml-2" />
                  احصل على إجابة AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Response */}
      {response && (
        <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              تحليل Media Buyer AI
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
