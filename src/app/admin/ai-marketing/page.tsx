"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, Lightbulb, Users, TrendingUp, Calendar, 
  DollarSign, Target, Zap, Loader2, Download, Copy,
  CheckCircle2, Eye, BarChart3
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIMarketingAssistant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("campaign");

  // Campaign Generator State
  const [campaignData, setCampaignData] = useState({
    productName: "",
    productDescription: "",
    budget: "",
    targetAudience: "",
    platform: "Facebook & Instagram"
  });

  // Competitors Analysis State
  const [competitorData, setCompetitorData] = useState({
    industry: "",
    competitors: ""
  });

  // Posting Times State
  const [postingData, setPostingData] = useState({
    targetAudience: "",
    platform: "Facebook & Instagram"
  });

  // Personas State
  const [personaData, setPersonaData] = useState({
    productType: "",
    priceRange: ""
  });

  // Ad Variations State
  const [adData, setAdData] = useState({
    productName: "",
    sellingPoints: "",
    tone: "عاطفي وجذاب"
  });

  // Content Calendar State
  const [calendarData, setCalendarData] = useState({
    duration: "30",
    postsPerWeek: "7",
    contentTypes: "متنوع (تعليمي، ترفيهي، ترويجي)"
  });

  // Trends State
  const [trendsData, setTrendsData] = useState({
    industry: ""
  });

  // Budget State
  const [budgetData, setBudgetData] = useState({
    totalBudget: "",
    platforms: "Facebook & Instagram",
    goals: "زيادة المبيعات"
  });

  const handleGenerateCampaign = async () => {
    if (!campaignData.productName || !campaignData.budget) {
      alert("من فضلك املأ اسم المنتج والميزانية على الأقل");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_campaign",
          data: campaignData
        })
      });

      const data = await response.json();
      setResult({ type: "campaign", content: data.campaign });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCompetitors = async () => {
    if (!competitorData.industry) {
      alert("من فضلك أدخل الصناعة");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_competitors",
          data: competitorData
        })
      });

      const data = await response.json();
      setResult({ type: "competitors", content: data.analysis });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestPostingTimes = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_posting_times",
          data: postingData
        })
      });

      const data = await response.json();
      setResult({ type: "posting", content: data.schedule });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePersonas = async () => {
    if (!personaData.productType) {
      alert("من فضلك أدخل نوع المنتج");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_audience_personas",
          data: personaData
        })
      });

      const data = await response.json();
      setResult({ type: "personas", content: data.personas });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAdVariations = async () => {
    if (!adData.productName) {
      alert("من فضلك أدخل اسم المنتج");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_ad_variations",
          data: adData
        })
      });

      const data = await response.json();
      setResult({ type: "variations", content: data.variations });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_content_calendar",
          data: calendarData
        })
      });

      const data = await response.json();
      setResult({ type: "calendar", content: data.calendar });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    if (!trendsData.industry) {
      alert("من فضلك أدخل الصناعة");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_trends",
          data: trendsData
        })
      });

      const data = await response.json();
      setResult({ type: "trends", content: data.trends });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeBudget = async () => {
    if (!budgetData.totalBudget) {
      alert("من فضلك أدخل الميزانية");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/ai-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize_budget",
          data: budgetData
        })
      });

      const data = await response.json();
      setResult({ type: "budget", content: data.budgetPlan });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      alert("تم النسخ بنجاح! ✅");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              مساعد التسويق بالذكاء الاصطناعي
            </h1>
          </div>
          <p className="text-xl text-gray-600">موظف تسويق محترف يعمل معاك 24/7 🚀</p>
          <p className="text-gray-500 mt-2">حملات كاملة • تحليل منافسين • محتوى • استراتيجيات • كل شيء بالذكاء الاصطناعي</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg mb-6">
            <TabsTrigger value="campaign" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Target className="w-4 h-4 ml-1" />
              حملة كاملة
            </TabsTrigger>
            <TabsTrigger value="competitors" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Eye className="w-4 h-4 ml-1" />
              المنافسين
            </TabsTrigger>
            <TabsTrigger value="posting" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 ml-1" />
              أوقات النشر
            </TabsTrigger>
            <TabsTrigger value="personas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 ml-1" />
              الجمهور
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
              <Zap className="w-4 h-4 ml-1" />
              نصوص إعلانية
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 ml-1" />
              خطة محتوى
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 ml-1" />
              الترندات
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 ml-1" />
              الميزانية
            </TabsTrigger>
          </TabsList>

          {/* Campaign Generator */}
          <TabsContent value="campaign">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-indigo-600" />
                  توليد حملة إعلانية كاملة ومتكاملة
                </CardTitle>
                <CardDescription>
                  AI سينشئ لك حملة كاملة: استراتيجية، استهداف، نصوص، جدول، KPIs، وأكثر!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اسم المنتج *</Label>
                  <Input
                    value={campaignData.productName}
                    onChange={(e) => setCampaignData({...campaignData, productName: e.target.value})}
                    placeholder="مثال: تيشيرت قطن مريح"
                  />
                </div>
                <div>
                  <Label>وصف المنتج</Label>
                  <Textarea
                    value={campaignData.productDescription}
                    onChange={(e) => setCampaignData({...campaignData, productDescription: e.target.value})}
                    placeholder="وصف مختصر للمنتج ومميزاته..."
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>الميزانية الشهرية (جنيه) *</Label>
                    <Input
                      type="number"
                      value={campaignData.budget}
                      onChange={(e) => setCampaignData({...campaignData, budget: e.target.value})}
                      placeholder="مثال: 5000"
                    />
                  </div>
                  <div>
                    <Label>الجمهور المستهدف</Label>
                    <Input
                      value={campaignData.targetAudience}
                      onChange={(e) => setCampaignData({...campaignData, targetAudience: e.target.value})}
                      placeholder="مثال: شباب 20-35 سنة"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerateCampaign}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري إنشاء الحملة...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      أنشئ حملة كاملة الآن
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitors Analysis */}
          <TabsContent value="competitors">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Eye className="w-6 h-6 text-blue-600" />
                  تحليل المنافسين
                </CardTitle>
                <CardDescription>
                  فهم استراتيجيات المنافسين ونقاط قوتهم وضعفهم والفرص المتاحة لك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الصناعة أو المجال *</Label>
                  <Input
                    value={competitorData.industry}
                    onChange={(e) => setCompetitorData({...competitorData, industry: e.target.value})}
                    placeholder="مثال: ملابس رجالي، إكسسوارات، إلكترونيات..."
                  />
                </div>
                <div>
                  <Label>أسماء المنافسين (اختياري)</Label>
                  <Textarea
                    value={competitorData.competitors}
                    onChange={(e) => setCompetitorData({...competitorData, competitors: e.target.value})}
                    placeholder="مثال: براند أ، براند ب، صفحة س..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleAnalyzeCompetitors}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 ml-2" />
                      حلل المنافسين الآن
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posting Times */}
          <TabsContent value="posting">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                  أفضل أوقات النشر
                </CardTitle>
                <CardDescription>
                  اعرف متى تنشر على Facebook و Instagram لأعلى تفاعل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الجمهور المستهدف</Label>
                  <Input
                    value={postingData.targetAudience}
                    onChange={(e) => setPostingData({...postingData, targetAudience: e.target.value})}
                    placeholder="مثال: موظفين، طلاب، أمهات..."
                  />
                </div>
                <Button
                  onClick={handleSuggestPostingTimes}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 ml-2" />
                      احصل على الجدول المثالي
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Personas */}
          <TabsContent value="personas">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="w-6 h-6 text-orange-600" />
                  إنشاء شخصيات الجمهور (Personas)
                </CardTitle>
                <CardDescription>
                  فهم عميق لجمهورك: من هم، ماذا يريدون، كيف تصل إليهم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نوع المنتج *</Label>
                  <Input
                    value={personaData.productType}
                    onChange={(e) => setPersonaData({...personaData, productType: e.target.value})}
                    placeholder="مثال: ملابس رياضية، إكسسوارات نسائية..."
                  />
                </div>
                <div>
                  <Label>نطاق السعر (جنيه)</Label>
                  <Input
                    value={personaData.priceRange}
                    onChange={(e) => setPersonaData({...personaData, priceRange: e.target.value})}
                    placeholder="مثال: 200-500"
                  />
                </div>
                <Button
                  onClick={handleCreatePersonas}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 ml-2" />
                      أنشئ 3 Personas
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Variations */}
          <TabsContent value="ads">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="w-6 h-6 text-pink-600" />
                  توليد نصوص إعلانية متعددة
                </CardTitle>
                <CardDescription>
                  10 نصوص إعلانية مختلفة للـ A/B Testing - جاهزة للاستخدام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اسم المنتج *</Label>
                  <Input
                    value={adData.productName}
                    onChange={(e) => setAdData({...adData, productName: e.target.value})}
                    placeholder="مثال: حذاء رياضي"
                  />
                </div>
                <div>
                  <Label>مميزات البيع الرئيسية</Label>
                  <Textarea
                    value={adData.sellingPoints}
                    onChange={(e) => setAdData({...adData, sellingPoints: e.target.value})}
                    placeholder="مثال: مريح، خفيف، عملي، سعر مناسب..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>الأسلوب المطلوب</Label>
                  <Input
                    value={adData.tone}
                    onChange={(e) => setAdData({...adData, tone: e.target.value})}
                    placeholder="مثال: عاطفي، مضحك، جاد، ملهم..."
                  />
                </div>
                <Button
                  onClick={handleGenerateAdVariations}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 ml-2" />
                      ولّد 10 نصوص إعلانية
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Calendar */}
          <TabsContent value="calendar">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  إنشاء خطة محتوى (Content Calendar)
                </CardTitle>
                <CardDescription>
                  خطة محتوى تفصيلية لـ 30 يوم - كل يوم بفكرته ونصه وتوقيته
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>المدة (أيام)</Label>
                    <Input
                      type="number"
                      value={calendarData.duration}
                      onChange={(e) => setCalendarData({...calendarData, duration: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label>عدد البوستات أسبوعياً</Label>
                    <Input
                      type="number"
                      value={calendarData.postsPerWeek}
                      onChange={(e) => setCalendarData({...calendarData, postsPerWeek: e.target.value})}
                      placeholder="7"
                    />
                  </div>
                </div>
                <div>
                  <Label>أنواع المحتوى المطلوبة</Label>
                  <Input
                    value={calendarData.contentTypes}
                    onChange={(e) => setCalendarData({...calendarData, contentTypes: e.target.value})}
                    placeholder="مثال: تعليمي، ترفيهي، ترويجي، تفاعلي..."
                  />
                </div>
                <Button
                  onClick={handleCreateCalendar}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 ml-2" />
                      أنشئ خطة المحتوى
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Analysis */}
          <TabsContent value="trends">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                  تحليل الترندات الحالية
                </CardTitle>
                <CardDescription>
                  اعرف الترندات الرائجة في مصر وكيف تستفيد منها في التسويق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الصناعة أو المجال *</Label>
                  <Input
                    value={trendsData.industry}
                    onChange={(e) => setTrendsData({...trendsData, industry: e.target.value})}
                    placeholder="مثال: موضة، تكنولوجيا، أكل..."
                  />
                </div>
                <Button
                  onClick={handleAnalyzeTrends}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 ml-2" />
                      حلل الترندات الآن
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Optimizer */}
          <TabsContent value="budget">
            <Card className="backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  تحسين توزيع الميزانية
                </CardTitle>
                <CardDescription>
                  احصل على خطة محسّنة لتوزيع ميزانيتك على المنصات والأهداف
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الميزانية الشهرية (جنيه) *</Label>
                  <Input
                    type="number"
                    value={budgetData.totalBudget}
                    onChange={(e) => setBudgetData({...budgetData, totalBudget: e.target.value})}
                    placeholder="مثال: 10000"
                  />
                </div>
                <div>
                  <Label>المنصات</Label>
                  <Input
                    value={budgetData.platforms}
                    onChange={(e) => setBudgetData({...budgetData, platforms: e.target.value})}
                    placeholder="Facebook & Instagram"
                  />
                </div>
                <div>
                  <Label>الأهداف الرئيسية</Label>
                  <Input
                    value={budgetData.goals}
                    onChange={(e) => setBudgetData({...budgetData, goals: e.target.value})}
                    placeholder="مثال: زيادة المبيعات، بناء الوعي..."
                  />
                </div>
                <Button
                  onClick={handleOptimizeBudget}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحسين...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5 ml-2" />
                      احصل على خطة الميزانية
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Results Section */}
        {result && (
          <Card className="mt-6 backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  نتيجة الذكاء الاصطناعي
                </CardTitle>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  نسخ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap bg-white p-6 rounded-lg border border-purple-200 text-gray-800 leading-relaxed">
                  {result.content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
