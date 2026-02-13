"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Lightbulb, Users, TrendingUp, Calendar, 
  DollarSign, Target, Zap, Loader2, Download, Copy,
  CheckCircle2, Eye, BarChart3, ArrowLeft, Brain,
  Megaphone, Activity, ShoppingCart, MessageCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface SmartMarketingClientProps {
  campaigns: any[];
  analytics: any[];
  orders: any[];
  keywords: any[];
}

export function SmartMarketingClient({ campaigns, analytics, orders, keywords }: SmartMarketingClientProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ai-assistant");

  // AI Assistant States
  const [campaignData, setCampaignData] = useState({
    productName: "",
    productDescription: "",
    budget: "",
    targetAudience: "",
    platform: "Facebook & Instagram"
  });

  // Media Buyer States
  const [mediaBuyerData, setMediaBuyerData] = useState({
    campaignObjective: "",
    targetBudget: "",
    targetAudience: "",
    adFormat: "image"
  });

  // Professional Marketing States
  const [professionalData, setProfessionalData] = useState({
    businessType: "",
    goals: "",
    timeframe: "30",
    budget: ""
  });

  // Stats calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const conversionRate = analytics.length > 0 ? (orders.length / analytics.reduce((sum, a) => sum + a.visitors, 0)) * 100 : 0;

  const handleGenerateAICampaign = async () => {
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

  const handleMediaBuyerOptimization = async () => {
    if (!mediaBuyerData.campaignObjective || !mediaBuyerData.targetBudget) {
      alert("من فضلك املأ الهدف والميزانية");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/media-buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize_campaign",
          data: mediaBuyerData,
          analytics: analytics,
          orders: orders
        })
      });

      const data = await response.json();
      setResult({ type: "mediabuyer", content: data.optimization });
    } catch (error) {
      alert("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalStrategy = async () => {
    if (!professionalData.businessType || !professionalData.goals) {
      alert("من فضلك املأ نوع العمل والأهداف");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/marketing/professional-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_strategy",
          data: professionalData,
          campaigns: campaigns,
          analytics: analytics
        })
      });

      const data = await response.json();
      setResult({ type: "professional", content: data.strategy });
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-indigo-100 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Brain className="w-10 h-10" />
                  🚀 التسويق الذكي بالـ AI
                </h1>
                <p className="text-indigo-100 mt-2">
                  مساعد التسويق • Media Buyer • الاستراتيجيات الاحترافية - كله في مكان واحد
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/ads-preview">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Eye className="w-4 h-4 mr-2" />
                  معاينة الإعلانات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-green-800">
                    {totalRevenue.toLocaleString('ar-EG')} جنيه
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">متوسط قيمة الطلب</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {avgOrderValue.toLocaleString('ar-EG')} جنيه
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">معدل التحويل</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {conversionRate.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">الحملات النشطة</p>
                  <p className="text-2xl font-bold text-orange-800">{campaigns.length}</p>
                </div>
                <Megaphone className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg">
            <TabsTrigger 
              value="ai-assistant" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-lg py-3"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              مساعد التسويق AI
            </TabsTrigger>
            <TabsTrigger 
              value="media-buyer" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-lg py-3"
            >
              <Target className="w-5 h-5 mr-2" />
              🎯 Media Buyer AI
            </TabsTrigger>
            <TabsTrigger 
              value="professional" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-lg py-3"
            >
              <Brain className="w-5 h-5 mr-2" />
              التسويق الاحترافي
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white text-lg py-3"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              تحليلات ذكية
            </TabsTrigger>
          </TabsList>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant">
            <div className="grid gap-6">
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    مساعد التسويق بالذكاء الاصطناعي
                  </CardTitle>
                  <CardDescription>
                    مولد حملات ذكي يحلل منتجاتك ويقترح استراتيجيات تسويقية مخصصة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>اسم المنتج *</Label>
                      <Input
                        value={campaignData.productName}
                        onChange={(e) => setCampaignData({...campaignData, productName: e.target.value})}
                        placeholder="مثال: تيشيرت قطن مريح"
                      />
                    </div>
                    <div>
                      <Label>الميزانية الشهرية (جنيه) *</Label>
                      <Input
                        type="number"
                        value={campaignData.budget}
                        onChange={(e) => setCampaignData({...campaignData, budget: e.target.value})}
                        placeholder="مثال: 5000"
                      />
                    </div>
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
                  <div>
                    <Label>الجمهور المستهدف</Label>
                    <Input
                      value={campaignData.targetAudience}
                      onChange={(e) => setCampaignData({...campaignData, targetAudience: e.target.value})}
                      placeholder="مثال: شباب 20-35 سنة"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateAICampaign}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري إنشاء الحملة...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        إنشاء حملة ذكية كاملة
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick AI Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                    <h3 className="font-semibold text-blue-800 mb-2">تحليل المنافسين</h3>
                    <p className="text-blue-600 text-sm">اكتشف استراتيجيات منافسيك</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-green-600 mb-3" />
                    <h3 className="font-semibold text-green-800 mb-2">جدولة ذكية</h3>
                    <p className="text-green-600 text-sm">أفضل أوقات النشر لجمهورك</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                    <h3 className="font-semibold text-purple-800 mb-2">نصوص إعلانية</h3>
                    <p className="text-purple-600 text-sm">محتوى جذاب ومقنع</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Media Buyer Tab */}
          <TabsContent value="media-buyer">
            <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-blue-600" />
                  🎯 Media Buyer بالذكاء الاصطناعي
                </CardTitle>
                <CardDescription>
                  تحسين حملاتك الإعلانية وزيادة معدل التحويل باستخدام AI متقدم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>هدف الحملة *</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={mediaBuyerData.campaignObjective}
                      onChange={(e) => setMediaBuyerData({...mediaBuyerData, campaignObjective: e.target.value})}
                    >
                      <option value="">اختر الهدف</option>
                      <option value="traffic">زيارات الموقع</option>
                      <option value="conversions">التحويلات</option>
                      <option value="leads">جذب عملاء محتملين</option>
                      <option value="sales">المبيعات</option>
                    </select>
                  </div>
                  <div>
                    <Label>الميزانية المستهدفة (جنيه) *</Label>
                    <Input
                      type="number"
                      value={mediaBuyerData.targetBudget}
                      onChange={(e) => setMediaBuyerData({...mediaBuyerData, targetBudget: e.target.value})}
                      placeholder="مثال: 3000"
                    />
                  </div>
                </div>
                <div>
                  <Label>الجمهور المستهدف</Label>
                  <Textarea
                    value={mediaBuyerData.targetAudience}
                    onChange={(e) => setMediaBuyerData({...mediaBuyerData, targetAudience: e.target.value})}
                    placeholder="اوصف جمهورك المستهدف بالتفصيل..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleMediaBuyerOptimization}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري تحسين الحملة...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 ml-2" />
                      تحسين الحملة بالـ AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Marketing Tab */}
          <TabsContent value="professional">
            <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Brain className="w-6 h-6 text-green-600" />
                  🚀 التسويق الاحترافي بالذكاء الاصطناعي
                </CardTitle>
                <CardDescription>
                  استراتيجية تسويقية شاملة مبنية على تحليل البيانات والذكاء الاصطناعي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>نوع العمل/النشاط *</Label>
                    <Input
                      value={professionalData.businessType}
                      onChange={(e) => setProfessionalData({...professionalData, businessType: e.target.value})}
                      placeholder="مثال: متجر ملابس، خدمات تعليمية، مطعم"
                    />
                  </div>
                  <div>
                    <Label>الميزانية الإجمالية (جنيه)</Label>
                    <Input
                      type="number"
                      value={professionalData.budget}
                      onChange={(e) => setProfessionalData({...professionalData, budget: e.target.value})}
                      placeholder="مثال: 10000"
                    />
                  </div>
                </div>
                <div>
                  <Label>الأهداف التسويقية *</Label>
                  <Textarea
                    value={professionalData.goals}
                    onChange={(e) => setProfessionalData({...professionalData, goals: e.target.value})}
                    placeholder="مثال: زيادة المبيعات، بناء الوعي بالعلامة التجارية، جذب عملاء جدد..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleProfessionalStrategy}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري إنشاء الاستراتيجية...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 ml-2" />
                      إنشاء استراتيجية احترافية
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              {/* Performance Overview */}
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    تحليلات الأداء الذكية
                  </CardTitle>
                  <CardDescription>
                    نظرة شاملة على أداء حملاتك مع اقتراحات ذكية للتحسين
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-600 text-sm font-medium">إجمالي الطلبات</span>
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-800">{orders.length}</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-600 text-sm font-medium">الإيرادات</span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-800">
                        {totalRevenue.toLocaleString('ar-EG')}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-600 text-sm font-medium">معدل التحويل</span>
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-800">
                        {conversionRate.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-600 text-sm font-medium">كلمات رئيسية</span>
                        <MessageCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-orange-800">{keywords.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Campaigns */}
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle>الحملات الحديثة</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">لا توجد حملات حتى الآن</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.slice(0, 5).map((campaign, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium">{campaign.name || `حملة ${index + 1}`}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(campaign.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {campaign.status || 'نشطة'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results Display */}
        {result && (
          <Card className="mt-8 backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  {result.type === 'campaign' && "حملة ذكية جديدة"}
                  {result.type === 'mediabuyer' && "تحسينات Media Buyer"}
                  {result.type === 'professional' && "استراتيجية احترافية"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="w-4 h-4 ml-1" />
                    نسخ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-arabic">
                  {result.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}