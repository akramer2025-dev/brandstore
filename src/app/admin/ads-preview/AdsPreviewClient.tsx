"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Eye, ExternalLink, Calendar, DollarSign, Users, 
  TrendingUp, Pause, Play, RefreshCw, Search,
  ArrowLeft, BarChart3, Globe, Target, Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface FacebookCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
  effective_status: string;
}

interface FacebookAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  daily_budget: string;
  targeting?: any;
  created_time: string;
}

interface FacebookAd {
  id: string;
  name: string;
  adset_id: string;
  status: string;
  creative?: any;
  created_time: string;
  preview_url?: string;
}

export function AdsPreviewClient() {
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const [adsets, setAdsets] = useState<FacebookAdSet[]>([]);
  const [ads, setAds] = useState<FacebookAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("campaigns");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdSets = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facebook/campaigns/${campaignId}/adsets`);
      if (response.ok) {
        const data = await response.json();
        setAdsets(data.adsets || []);
        setSelectedCampaign(campaignId);
        setActiveTab("adsets");
      }
    } catch (error) {
      console.error('Error fetching adsets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async (adsetId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facebook/adsets/${adsetId}/ads`);
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
        setActiveTab("ads");
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const response = await fetch(`/api/facebook/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budget: string) => {
    return parseFloat(budget).toLocaleString('ar-EG') + ' جنيه';
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.objective.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-100 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Eye className="w-8 h-8" />
                  معاينة الإعلانات
                </h1>
                <p className="text-blue-100 mt-2">
                  عرض وإدارة جميع الحملات الإعلانية على فيسبوك
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchCampaigns}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Link href="https://www.facebook.com/ads/manager" target="_blank">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ads Manager
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="البحث في الحملات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">الحملات النشطة</p>
                  <p className="text-2xl font-bold text-green-800">
                    {campaigns.filter(c => c.status === 'ACTIVE').length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">الحملات المتوقفة</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {campaigns.filter(c => c.status === 'PAUSED').length}
                  </p>
                </div>
                <Pause className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">إجمالي الحملات</p>
                  <p className="text-2xl font-bold text-blue-800">{campaigns.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">إجمالي الميزانية</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {campaigns.reduce((total, c) => {
                      const budget = parseFloat(c.daily_budget || c.lifetime_budget || '0');
                      return total + budget;
                    }, 0).toLocaleString('ar-EG')} جنيه
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns" className="text-lg">
              <Target className="w-5 h-5 mr-2" />
              الحملات ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="adsets" disabled={!selectedCampaign}>
              <Users className="w-5 h-5 mr-2" />
              مجموعات الإعلانات ({adsets.length})
            </TabsTrigger>
            <TabsTrigger value="ads" disabled={ads.length === 0}>
              <Globe className="w-5 h-5 mr-2" />
              الإعلانات ({ads.length})
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="grid gap-6">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">جاري تحميل الحملات...</p>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد حملات</h3>
                    <p className="text-gray-500 mb-4">لم يتم العثور على أي حملات إعلانية</p>
                    <Link href="/admin/marketing">
                      <Button>إنشاء حملة جديدة</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-3">
                            {campaign.name}
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status === 'ACTIVE' ? 'نشطة' : 
                               campaign.status === 'PAUSED' ? 'متوقفة' : 'محذوفة'}
                            </Badge>
                          </CardTitle>
                          <p className="text-gray-600 mb-2">
                            <strong>الهدف:</strong> {campaign.objective}
                          </p>
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            تم الإنشاء في: {formatDate(campaign.created_time)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {(campaign.daily_budget || campaign.lifetime_budget) && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatBudget(campaign.daily_budget || campaign.lifetime_budget || '0')}
                              {campaign.daily_budget ? '/يوم' : '/إجمالية'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => fetchAdSets(campaign.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          عرض مجموعات الإعلانات
                        </Button>
                        <Button
                          onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                          variant="outline"
                          size="sm"
                          className={campaign.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {campaign.status === 'ACTIVE' ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              إيقاف مؤقت
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              تشغيل
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => window.open(`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=EG&view_all_page_id=103042954595602&search_type=page&media_type=all`, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          معاينة في Facebook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* AdSets Tab */}
          <TabsContent value="adsets">
            <div className="grid gap-6">
              {adsets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد مجموعات إعلانات</h3>
                    <p className="text-gray-500">اختر حملة لعرض مجموعات الإعلانات الخاصة بها</p>
                  </CardContent>
                </Card>
              ) : (
                adsets.map((adset) => (
                  <Card key={adset.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-3">
                        {adset.name}
                        <Badge className={getStatusColor(adset.status)}>
                          {adset.status === 'ACTIVE' ? 'نشطة' : 
                           adset.status === 'PAUSED' ? 'متوقفة' : 'محذوفة'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        تم الإنشاء في: {formatDate(adset.created_time)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatBudget(adset.daily_budget)}/يوم
                        </Badge>
                      </div>
                      <Button
                        onClick={() => fetchAds(adset.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        عرض الإعلانات
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <div className="grid gap-6">
              {ads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Globe className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إعلانات</h3>
                    <p className="text-gray-500">اختر مجموعة إعلانات لعرض الإعلانات الخاصة بها</p>
                  </CardContent>
                </Card>
              ) : (
                ads.map((ad) => (
                  <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-3">
                        {ad.name}
                        <Badge className={getStatusColor(ad.status)}>
                          {ad.status === 'ACTIVE' ? 'نشط' : 
                           ad.status === 'PAUSED' ? 'متوقف' : 'محذوف'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        تم الإنشاء في: {formatDate(ad.created_time)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {ad.preview_url && (
                          <Button
                            onClick={() => window.open(ad.preview_url, '_blank')}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            معاينة الإعلان
                          </Button>
                        )}
                        <Button
                          onClick={() => window.open(`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=EG&view_all_page_id=103042954595602&search_type=page&media_type=all`, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          معاينة في Facebook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}