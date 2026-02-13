"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, Target, 
  XCircle, Clock, Zap, Eye, ExternalLink, Wrench, TrendingUp,
  Bug, Activity, Settings, Info, Sparkles, Brain, Users, 
  BarChart3, LineChart, PieChart, DollarSign, Megaphone,
  MessageSquare, Heart, Star, Share2, Calendar
} from "lucide-react";
import Link from "next/link";

interface CampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  adsCount?: {
    total: number;
    active: number;
    paused: number;
    rejected: number;
    pending: number;
    ads: any[];
  };
  insights?: {
    spend: string;
    impressions: string;
    clicks: string;
    ctr: string;
    cpm: string;
    reach: string;
  };
}

export function MarketingCenterClient() {
  const [activeTab, setActiveTab] = useState("ai-marketing");
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [environment, setEnvironment] = useState<any>(null);

  // Load campaigns data
  useEffect(() => {
    if (activeTab === "campaigns" || activeTab === "ads-fixer" || activeTab === "ads-preview") {
      loadCampaigns();
    }
  }, [activeTab]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/campaigns-detailed');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/facebook/check-environment');
      if (response.ok) {
        const data = await response.json();
        setEnvironment(data);
      }
    } catch (error) {
      console.error('Error checking environment:', error);
    }
  };

  // AI Marketing Functions
  const generateAIStrategy = async (type: string) => {
    try {
      setLoading(true);
      setAiResponse("جاري توليد الاستراتيجية...");
      
      const response = await fetch('/api/marketing/professional-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          businessContext: "متجر ملابس أونلاين - RemoStore"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.strategy || "تم توليد الاستراتيجية بنجاح!");
      } else {
        setAiResponse("حدث خطأ في توليد الاستراتيجية");
      }
    } catch (error) {
      setAiResponse("خطأ في الاتصال بخدمة AI");
    } finally {
      setLoading(false);
    }
  };

  const generateMediaBuyerAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing/media-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaigns: campaigns.slice(0, 3),
          analysisType: "performance-optimization"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.analysis || "تم تحليل الأداء بنجاح!");
      }
    } catch (error) {
      setAiResponse("خطأ في تحليل الأداء");
    } finally {
      setLoading(false);
    }
  };

  const fixMissingAds = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/fix-missing-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ ${data.message}`);
        loadCampaigns();
      } else {
        alert(`❌ خطأ: ${data.error}`);
      }
    } catch (error) {
      alert('❌ حدث خطأ في الإصلاح');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border border-green-200';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'DELETED': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-purple-100 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Sparkles className="w-10 h-10" />
                  🚀 مركز التسويق المتكامل
                </h1>
                <p className="text-purple-100 mt-2">
                  جميع أدوات التسويق والذكاء الاصطناعي في مكان واحد
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2 h-auto p-2 bg-white/50 border border-gray-200 rounded-lg">
            <TabsTrigger 
              value="ai-marketing" 
              className="flex flex-col items-center p-4 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800"
            >
              <Brain className="w-5 h-5 mb-1" />
              <span className="text-xs">التسويق الذكي</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="campaigns" 
              className="flex flex-col items-center p-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              <Target className="w-5 h-5 mb-1" />
              <span className="text-xs">إدارة الحملات</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="ads-fixer" 
              className="flex flex-col items-center p-4 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800"
            >
              <Wrench className="w-5 h-5 mb-1" />
              <span className="text-xs">إصلاح الإعلانات</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="ads-preview" 
              className="flex flex-col items-center p-4 data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
            >
              <Eye className="w-5 h-5 mb-1" />
              <span className="text-xs">معاينة الإعلانات</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="traditional" 
              className="flex flex-col items-center p-4 data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
            >
              <TrendingUp className="w-5 h-5 mb-1" />
              <span className="text-xs">التسويق التقليدي</span>
            </TabsTrigger>

            <TabsTrigger 
              value="analytics" 
              className="flex flex-col items-center p-4 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
            >
              <BarChart3 className="w-5 h-5 mb-1" />
              <span className="text-xs">التحليلات</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Marketing Tab */}
          <TabsContent value="ai-marketing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* AI Assistant */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Brain className="w-6 h-6" />
                    🤖 مساعد التسويق الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      onClick={() => generateAIStrategy("brand-awareness")}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      استراتيجية الوعي بالعلامة
                    </Button>
                    
                    <Button 
                      onClick={() => generateAIStrategy("sales-conversion")}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      استراتيجية المبيعات
                    </Button>
                    
                    <Button 
                      onClick={() => generateAIStrategy("social-engagement")}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      استراتيجية التفاعل
                    </Button>
                    
                    <Button 
                      onClick={generateMediaBuyerAnalysis}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      تحليل Media Buyer
                    </Button>
                  </div>

                  {aiResponse && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-semibold mb-2 text-gray-700">نتيجة الذكاء الاصطناعي:</h4>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {aiResponse}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Tools Grid */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Settings className="w-6 h-6" />
                    🛠️ أدوات التسويق الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center border-blue-200 hover:bg-blue-50"
                    >
                      <MessageSquare className="w-6 h-6 mb-2 text-blue-600" />
                      <span className="text-xs">توليد محتوى</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center border-green-200 hover:bg-green-50"
                    >
                      <Share2 className="w-6 h-6 mb-2 text-green-600" />
                      <span className="text-xs">استراتيجية التوزيع</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center border-purple-200 hover:bg-purple-50"
                    >
                      <Calendar className="w-6 h-6 mb-2 text-purple-600" />
                      <span className="text-xs">جدولة المنشورات</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center border-orange-200 hover:bg-orange-50"
                    >
                      <Star className="w-6 h-6 mb-2 text-orange-600" />
                      <span className="text-xs">تحسين الإعلانات</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaign Management Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">إدارة الحملات الإعلانية</h2>
              <div className="flex gap-2">
                <Button onClick={loadCampaigns} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
                <Button onClick={() => window.open('https://www.facebook.com/ads/manager', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Facebook Ads Manager
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">جاري تحميل الحملات...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لم يتم العثور على حملات</h3>
                  <p className="text-gray-500 mb-4">ابدأ بإنشاء حملة جديدة</p>
                  <Button onClick={() => window.open('https://www.facebook.com/ads/manager', '_blank')}>
                    إنشاء حملة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-3">
                            {campaign.name}
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status === 'ACTIVE' ? 'نشطة' : 
                               campaign.status === 'PAUSED' ? 'متوقفة' : 'محذوفة'}
                            </Badge>
                            <Badge variant="outline">
                              {campaign.objective}
                            </Badge>
                          </CardTitle>
                          
                          {campaign.insights && (
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                              <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <p className="text-blue-600 text-xs font-medium">الإنفاق</p>
                                <p className="text-lg font-bold text-blue-800">{campaign.insights.spend}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-green-600 text-xs font-medium">الوصول</p>
                                <p className="text-lg font-bold text-green-800">{campaign.insights.reach}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg text-center">
                                <p className="text-purple-600 text-xs font-medium">الانطباعات</p>
                                <p className="text-lg font-bold text-purple-800">{campaign.insights.impressions}</p>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg text-center">
                                <p className="text-orange-600 text-xs font-medium">النقرات</p>
                                <p className="text-lg font-bold text-orange-800">{campaign.insights.clicks}</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg text-center">
                                <p className="text-red-600 text-xs font-medium">نسبة النقر</p>
                                <p className="text-lg font-bold text-red-800">{campaign.insights.ctr}%</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                <p className="text-yellow-600 text-xs font-medium">تكلفة الألف</p>
                                <p className="text-lg font-bold text-yellow-800">{campaign.insights.cpm}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => window.open(`https://www.facebook.com/ads/manager/campaigns?act=${process.env.NEXT_PUBLIC_FACEBOOK_AD_ACCOUNT_ID}&campaign_ids=${campaign.id}`, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          تحرير في Facebook
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          عرض التحليلات
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ads Fixer Tab */}
          <TabsContent value="ads-fixer" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">إصلاح الإعلانات المفقودة</h2>
              <Button onClick={checkEnvironment}>
                <Settings className="w-4 h-4 mr-2" />
                فحص البيئة
              </Button>
            </div>

            {environment && (
              <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Settings className="w-5 h-5" />
                    حالة بيئة Facebook API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded-lg border ${environment.environment?.tokenValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2">
                        {environment.environment?.tokenValid ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                        <span className="text-sm font-medium">رمز الوصول</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border ${environment.environment?.pageAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2">
                        {environment.environment?.pageAccess ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                        <span className="text-sm font-medium">صفحة Facebook</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border ${environment.environment?.adAccountAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2">
                        {environment.environment?.adAccountAccess ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                        <span className="text-sm font-medium">الحساب الإعلاني</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
              {campaigns.filter(c => !c.adsCount || c.adsCount.total === 0).map((campaign) => (
                <Card key={campaign.id} className="border-l-4 border-l-red-500 bg-red-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-3">
                          <XCircle className="w-5 h-5 text-red-600" />
                          {campaign.name}
                          <Badge className="bg-red-100 text-red-800">
                            لا توجد إعلانات
                          </Badge>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fixMissingAds(campaign.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            جاري الإصلاح...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            إصلاح الآن
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ads Preview Tab */}
          <TabsContent value="ads-preview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">معاينة الإعلانات</h2>
              <Button onClick={loadCampaigns} disabled={loading}>
                <Eye className="w-4 h-4 mr-2" />
                تحديث المعاينة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.filter(c => c.adsCount && c.adsCount.total > 0).map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {campaign.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="text-center text-gray-500">
                          <Eye className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">معاينة الإعلان</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {campaign.adsCount?.total || 0} إعلان
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => window.open(`https://www.facebook.com/ads/manager/campaigns?act=${process.env.NEXT_PUBLIC_FACEBOOK_AD_ACCOUNT_ID}&campaign_ids=${campaign.id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        عرض في Facebook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Traditional Marketing Tab */}
          <TabsContent value="traditional" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 التسويق التقليدي</h2>
              <p className="text-gray-600 mb-8">أدوات التسويق التقليدي والحملات المباشرة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Megaphone className="w-6 h-6" />
                    الإعلانات المطبوعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">إدارة الحملات الإعلانية في الصحف والمجلات</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    إدارة الحملات
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Users className="w-6 h-6" />
                    الفعاليات والمعارض
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">تنظيم ومتابعة الفعاليات التسويقية</p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    جدولة فعالية
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Heart className="w-6 h-6" />
                    العلاقات العامة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">إدارة العلاقات مع الإعلام والعملاء</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    إدارة العلاقات
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 تحليلات التسويق المتقدمة</h2>
              <p className="text-gray-600 mb-8">تحليل شامل لأداء جميع الحملات التسويقية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">إجمالي الحملات</p>
                      <p className="text-3xl font-bold text-blue-800">{campaigns.length}</p>
                    </div>
                    <BarChart3 className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">الحملات النشطة</p>
                      <p className="text-3xl font-bold text-green-800">
                        {campaigns.filter(c => c.status === 'ACTIVE').length}
                      </p>
                    </div>
                    <LineChart className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">معدل التفاعل</p>
                      <p className="text-3xl font-bold text-purple-800">12.5%</p>
                    </div>
                    <PieChart className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">العائد على الاستثمار</p>
                      <p className="text-3xl font-bold text-orange-800">3.2x</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء الحملات الأسبوعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <LineChart className="w-16 h-16 mx-auto mb-4" />
                      <p>مخطط الأداء الأسبوعي</p>
                      <p className="text-sm text-gray-400 mt-2">سيتم عرض البيانات هنا</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع الإنفاق الإعلاني</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <PieChart className="w-16 h-16 mx-auto mb-4" />
                      <p>توزيع الميزانية</p>
                      <p className="text-sm text-gray-400 mt-2">سيتم عرض البيانات هنا</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}