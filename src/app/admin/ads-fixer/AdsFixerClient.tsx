"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, 
  XCircle, Clock, Zap, Eye, ExternalLink, Wrench,
  Bug, Activity, Target, Settings, Info
} from "lucide-react";
import Link from "next/link";

interface CampaignDebugInfo {
  id: string;
  name: string;
  status: string;
  objective: string;
  adsCount: {
    total: number;
    active: number;
    paused: number;
    rejected: number;
    pending: number;
    ads: any[];
  };
}

export function AdsFixerClient() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignDebugInfo[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [fixingCampaign, setFixingCampaign] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<any>(null);
  const [isCheckingEnvironment, setIsCheckingEnvironment] = useState(false);

  useEffect(() => {
    loadDebugInfo();
    checkEnvironment(); // Also check environment on load
  }, []);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/debug-ads');
      if (response.ok) {
        const data = await response.json();
        
        // Transform data for display
        const campaignsWithAds = data.campaigns.map((campaign: any) => ({
          ...campaign,
          adsCount: data.campaignAdsCount[campaign.id] || {
            total: 0,
            active: 0,
            paused: 0,
            rejected: 0,
            pending: 0,
            ads: []
          }
        }));
        
        setCampaigns(campaignsWithAds);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = async () => {
    try {
      setIsCheckingEnvironment(true);
      const response = await fetch('/api/facebook/check-environment');
      if (response.ok) {
        const data = await response.json();
        setEnvironment(data);
      }
    } catch (error) {
      console.error('Error checking environment:', error);
    } finally {
      setIsCheckingEnvironment(false);
    }
  };

  const fixMissingAds = async (campaignId: string) => {
    try {
      setFixingCampaign(campaignId);
      console.log("🚀 بدء إصلاح الإعلان لحملة:", campaignId);
      
      const response = await fetch('/api/facebook/fix-missing-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      
      console.log("📡 رد الخادم:", response.status, response.statusText);
      
      const data = await response.json();
      console.log("📄 بيانات الرد:", data);
      
      if (response.ok) {
        const successMessage = [
          `✅ ${data.message}`,
          data.ad?.id ? `\n🆔 معرف الإعلان: ${data.ad.id}` : '',
          data.ad?.type ? `\n🎨 نوع الإعلان: ${data.ad.type === 'with-image' ? 'مع صورة' : data.ad.type === 'text-only' ? 'نصي بسيط' : data.ad.type}` : ''
        ].filter(Boolean).join('');
        
        alert(successMessage);
        loadDebugInfo(); // Reload to see changes
      } else {
        let errorMessage = `❌ خطأ: ${data.error}`;
        
        if (data.suggestion) {
          errorMessage += `\n\n💡 اقتراح: ${data.suggestion}`;
        }
        
        if (data.originalError) {
          errorMessage += `\n\n🔧 خطأ Facebook الأصلي: ${data.originalError}`;
        }
        
        if (data.textError) {
          errorMessage += `\n🔧 خطأ الإعلان النصي: ${data.textError}`;
        }
        
        if (data.debugInfo) {
          errorMessage += `\n\n🔍 معلومات التشخيص:`;
          errorMessage += `\n- معرف الصفحة: ${data.debugInfo.pageId}`;
          errorMessage += `\n- الحساب الإعلاني: ${data.debugInfo.adAccount}`;
          if (data.debugInfo.adSetId) {
            errorMessage += `\n- مجموعة الإعلانات: ${data.debugInfo.adSetId}`;
          }
        }
        
        console.error("❌ تفاصيل الخطأ الكاملة:", data);
        alert(errorMessage);
        
        // Show suggestion to check environment or test connection
        if (response.status === 400) {
          const shouldCheck = confirm(`\nهل تريد:\n1. فحص إعدادات Facebook API؟\n2. اختبار الاتصال؟\n\nاختر "موافق" للفحص، أو "إلغاء" لاختبار الاتصال`);
          if (shouldCheck) {
            checkEnvironment();
          } else {
            window.open('/api/facebook/test-connection', '_blank');
          }
        }
      }
    } catch (error) {
      console.error('خطأ في طلب الإصلاح:', error);
      alert(`❌ حدث خطأ في الإصلاح\n\nالخطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}\n\n💡 تحقق من اتصال الإنترنت أو راجع سجل الخادم`);
    } finally {
      setFixingCampaign(null);
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

  const getHealthStatus = (campaign: CampaignDebugInfo) => {
    const { adsCount } = campaign;
    
    if (adsCount.total === 0) {
      return { status: 'critical', icon: XCircle, text: 'لا توجد إعلانات', color: 'text-red-600' };
    } else if (adsCount.active === 0) {
      return { status: 'warning', icon: AlertTriangle, text: 'لا توجد إعلانات نشطة', color: 'text-yellow-600' };
    } else if (adsCount.rejected > 0) {
      return { status: 'warning', icon: AlertTriangle, text: 'يوجد إعلانات مرفوضة', color: 'text-orange-600' };
    } else {
      return { status: 'healthy', icon: CheckCircle2, text: 'صحية', color: 'text-green-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-red-100 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Wrench className="w-10 h-10" />
                  🔧 إصلاح الإعلانات المفقودة
                </h1>
                <p className="text-red-100 mt-2">
                  تشخيص وإصلاح مشاكل الإعلانات التي لا تظهر في Facebook Ads Manager
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadDebugInfo}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                إعادة فحص
              </Button>
              
              <Link href="/admin/campaign-manager">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Target className="w-4 h-4 mr-2" />
                  إدارة الحملات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">إجمالي الحملات</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {summary.totalCampaigns || 0}
                  </p>
                </div>
                <Target className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">إجمالي الإعلانات</p>
                  <p className="text-3xl font-bold text-green-800">
                    {summary.totalAds || 0}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">حملات بدون إعلانات</p>
                  <p className="text-3xl font-bold text-orange-800">
                    {campaigns.filter(c => c.adsCount.total === 0).length}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">إعلانات بمشاكل</p>
                  <p className="text-3xl font-bold text-red-800">
                    {summary.adsWithIssues || 0}
                  </p>
                </div>
                <Bug className="w-10 h-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Check Section */}
        <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Settings className="w-5 h-5" />
              فحص بيئة Facebook API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={checkEnvironment}
                disabled={isCheckingEnvironment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bug className={`w-4 h-4 mr-2 ${isCheckingEnvironment ? 'animate-spin' : ''}`} />
                {isCheckingEnvironment ? 'جاري الفحص...' : 'فحص البيئة'}
              </Button>

              <Button
                onClick={() => window.open('/api/facebook/test-connection', '_blank')}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Activity className="w-4 h-4 mr-2" />
                اختبار الاتصال
              </Button>
              
              {environment && (
                <Badge className={
                  environment.overallStatus === 'ready' ? 'bg-green-100 text-green-800' :
                  environment.overallStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {environment.overallStatus === 'ready' ? '✅ جاهز للعمل' :
                   environment.overallStatus === 'partial' ? '⚠️ بعض المشاكل' :
                   '❌ غير جاهز'}
                </Badge>
              )}
            </div>

            {environment && (
              <div className="space-y-4">
                {/* Environment Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg border ${environment.environment.tokenValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {environment.environment.tokenValid ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                      <span className="text-sm font-medium">رمز الوصول</span>
                    </div>
                    {environment.tokenOwner && (
                      <p className="text-xs text-gray-600 mt-1">المالك: {environment.tokenOwner}</p>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border ${environment.environment.pageAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {environment.environment.pageAccess ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                      <span className="text-sm font-medium">صفحة Facebook</span>
                    </div>
                    {environment.pageInfo && (
                      <p className="text-xs text-gray-600 mt-1">{environment.pageInfo.name}</p>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border ${environment.environment.adAccountAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {environment.environment.adAccountAccess ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                      <span className="text-sm font-medium">الحساب الإعلاني</span>
                    </div>
                    {environment.adAccountInfo && (
                      <p className="text-xs text-gray-600 mt-1">{environment.adAccountInfo.name}</p>
                    )}
                  </div>
                </div>

                {/* Errors and Warnings */}
                {(environment.errors?.length > 0 || environment.warnings?.length > 0) && (
                  <div className="space-y-2">
                    {environment.errors?.map((error: string, index: number) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                          <span className="text-sm text-red-800">{error}</span>
                        </div>
                      </div>
                    ))}
                    
                    {environment.warnings?.map((warning: string, index: number) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm text-yellow-800">{warning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Resources */}
                {(environment.availablePages?.length > 0 || environment.availableAdAccounts?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {environment.availablePages?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">الصفحات المتاحة ({environment.availablePages.length})</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {environment.availablePages.slice(0, 5).map((page: any) => (
                            <div key={page.id} className="text-xs p-2 bg-gray-50 rounded">
                              {page.name} ({page.id})
                            </div>
                          ))}
                          {environment.availablePages.length > 5 && (
                            <div className="text-xs text-gray-500">+{environment.availablePages.length - 5} المزيد...</div>
                          )}
                        </div>
                      </div>
                    )}

                    {environment.availableAdAccounts?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">الحسابات الإعلانية المتاحة ({environment.availableAdAccounts.length})</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {environment.availableAdAccounts.slice(0, 5).map((account: any) => (
                            <div key={account.id} className="text-xs p-2 bg-gray-50 rounded">
                              {account.name} ({account.id})
                            </div>
                          ))}
                          {environment.availableAdAccounts.length > 5 && (
                            <div className="text-xs text-gray-500">+{environment.availableAdAccounts.length - 5} المزيد...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns Analysis */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">جاري فحص الحملات والإعلانات...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bug className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لم يتم العثور على حملات</h3>
                <p className="text-gray-500 mb-4">تأكد من إعداد Facebook API بشكل صحيح</p>
                <Link href="/admin/campaign-manager">
                  <Button>إنشاء حملة جديدة</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => {
              const health = getHealthStatus(campaign);
              const HealthIcon = health.icon;
              
              return (
                <Card key={campaign.id} className={`hover:shadow-xl transition-all duration-300 ${
                  health.status === 'critical' ? 'border-l-4 border-l-red-500 bg-red-50/50' :
                  health.status === 'warning' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/50' :
                  'border-l-4 border-l-green-500 bg-green-50/50'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-3 flex items-center gap-3">
                          {campaign.name}
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status === 'ACTIVE' ? 'نشطة' : 
                             campaign.status === 'PAUSED' ? 'متوقفة' : 'محذوفة'}
                          </Badge>
                          <Badge variant="outline">
                            {campaign.objective}
                          </Badge>
                        </CardTitle>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <HealthIcon className={`w-5 h-5 ${health.color}`} />
                          <span className={`font-medium ${health.color}`}>
                            الحالة: {health.text}
                          </span>
                        </div>

                        {/* Ads Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <p className="text-blue-600 text-xs font-medium">إجمالي الإعلانات</p>
                            <p className="text-xl font-bold text-blue-800">
                              {campaign.adsCount.total}
                            </p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <p className="text-green-600 text-xs font-medium">نشطة</p>
                            <p className="text-xl font-bold text-green-800">
                              {campaign.adsCount.active}
                            </p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded-lg text-center">
                            <p className="text-yellow-600 text-xs font-medium">متوقفة</p>
                            <p className="text-xl font-bold text-yellow-800">
                              {campaign.adsCount.paused}
                            </p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg text-center">
                            <p className="text-red-600 text-xs font-medium">مرفوضة</p>
                            <p className="text-xl font-bold text-red-800">
                              {campaign.adsCount.rejected}
                            </p>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg text-center">
                            <p className="text-orange-600 text-xs font-medium">قيد المراجعة</p>
                            <p className="text-xl font-bold text-orange-800">
                              {campaign.adsCount.pending}
                            </p>
                          </div>
                        </div>

                        {/* Individual Ads */}
                        {campaign.adsCount.ads.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">الإعلانات الموجودة:</h4>
                            <div className="space-y-2">
                              {campaign.adsCount.ads.map((ad: any) => (
                                <div key={ad.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{ad.name}</span>
                                    <Badge className={getStatusColor(ad.status)} size="sm">
                                      {ad.status}
                                    </Badge>
                                    {ad.effective_status && ad.effective_status !== ad.status && (
                                      <Badge variant="outline" size="sm">
                                        {ad.effective_status}
                                      </Badge>
                                    )}
                                  </div>
                                  {ad.issues_info && ad.issues_info.length > 0 && (
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {campaign.adsCount.total === 0 && (
                        <Button
                          onClick={() => fixMissingAds(campaign.id)}
                          disabled={fixingCampaign === campaign.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {fixingCampaign === campaign.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              جاري الإصلاح...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              إنشاء إعلانات مفقودة
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => window.open(`https://www.facebook.com/ads/manager/campaigns?act=${process.env.NEXT_PUBLIC_FACEBOOK_AD_ACCOUNT_ID}&campaign_ids=${campaign.id}`, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        فتح في Facebook
                      </Button>
                      
                      <Link href="/admin/campaign-manager">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          إدارة الحملة
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="w-6 h-6" />
              معلومات مفيدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">🔴 حملة بدون إعلانات:</h4>
                <p>يعني إن الحملة موجودة بس مافيش إعلانات اتعملت جواها. دي مشكلة شائعة لما يحصل خطأ في إنشاء الإعلان.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🟡 إعلانات متوقفة:</h4>
                <p>الإعلانات موجودة بس متوقفة. ممكن تشغلها من إدارة الحملات أو من Facebook مباشرة.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🟠 إعلانات مرفوضة:</h4>
                <p>Facebook رفض الإعلانات دي. راجع سياسات Facebook وعدّل المحتوى.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🟢 حالة صحية:</h4>
                <p>الحملة شغالة كويس وفيها إعلانات نشطة. مبروك! 🎉</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}