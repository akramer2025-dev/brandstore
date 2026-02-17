"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Eye, ExternalLink, Calendar, DollarSign, Users, 
  TrendingUp, Pause, Play, RefreshCw, Search, Edit,
  ArrowLeft, BarChart3, Globe, Target, Settings,
  Plus, Trash2, Save, X, AlertCircle, CheckCircle2,
  Activity, Zap, Brain, Megaphone, LineChart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  insights?: {
    spend?: string;
    impressions?: string;
    clicks?: string;
    ctr?: string;
    cpc?: string;
    cpm?: string;
  };
}

interface CampaignEdit {
  id: string;
  name: string;
  daily_budget: string;
  status: string;
}

export function CampaignManagerClient() {
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCampaign, setEditingCampaign] = useState<CampaignEdit | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // New Campaign States
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    objective: "LINK_CLICKS",
    daily_budget: "",
    target_description: "",
    ad_text: "",
    image_url: ""
  });
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/campaigns-detailed');
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

  const handleEditCampaign = (campaign: FacebookCampaign) => {
    setEditingCampaign({
      id: campaign.id,
      name: campaign.name,
      daily_budget: campaign.daily_budget || "",
      status: campaign.status
    });
    setShowEditDialog(true);
  };

  const saveCampaignChanges = async () => {
    if (!editingCampaign) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/facebook/campaigns/${editingCampaign.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCampaign),
      });
      
      if (response.ok) {
        setShowEditDialog(false);
        setEditingCampaign(null);
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeCampaign = async (campaignId: string) => {
    try {
      setOptimizationLoading(campaignId);
      const response = await fetch('/api/facebook/campaigns/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`تحسين الحملة تم!\n${data.suggestions || 'تم تطبيق التحسينات المقترحة'}`);
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error optimizing campaign:', error);
      alert('حدث خطأ في تحسين الحملة');
    } finally {
      setOptimizationLoading(null);
    }
  };

  const createNewCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      
      if (response.ok) {
        setShowNewCampaignDialog(false);
        setNewCampaign({
          name: "",
          objective: "LINK_CLICKS",
          daily_budget: "",
          target_description: "",
          ad_text: "",
          image_url: ""
        });
        fetchCampaigns();
        alert('تم إنشاء الحملة بنجاح!');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('حدث خطأ في إنشاء الحملة');
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

  const formatNumber = (value: string | undefined) => {
    if (!value) return '0';
    return parseFloat(value).toLocaleString('ar-EG');
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.objective.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalSpend = campaigns.reduce((sum, c) => sum + parseFloat(c.insights?.spend || '0'), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + parseFloat(c.insights?.clicks || '0'), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + parseFloat(c.insights?.impressions || '0'), 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-100 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Megaphone className="w-10 h-10" />
                  🎯 إدارة الحملات الإعلانية
                </h1>
                <p className="text-indigo-100 mt-2">
                  عرض وتعديل وتحسين جميع الحملات • Media Buyer • تحليلات متقدمة
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء حملة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إنشاء حملة إعلانية جديدة</DialogTitle>
                    <DialogDescription>
                      املأ البيانات التالية للحملة الجديدة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>اسم الحملة</Label>
                        <Input
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                          placeholder="اسم الحملة..."
                        />
                      </div>
                      <div>
                        <Label>الهدف</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={newCampaign.objective}
                          onChange={(e) => setNewCampaign({...newCampaign, objective: e.target.value})}
                        >
                          <option value="LINK_CLICKS">زيارات الموقع</option>
                          <option value="CONVERSIONS">التحويلات</option>
                          <option value="REACH">الوصول</option>
                          <option value="TRAFFIC">حركة المرور</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>الميزانية اليومية (جنيه)</Label>
                      <Input
                        type="number"
                        value={newCampaign.daily_budget}
                        onChange={(e) => setNewCampaign({...newCampaign, daily_budget: e.target.value})}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label>وصف الجمهور المستهدف</Label>
                      <Textarea
                        value={newCampaign.target_description}
                        onChange={(e) => setNewCampaign({...newCampaign, target_description: e.target.value})}
                        placeholder="مثال: رجال ونساء 25-45 سنة مهتمين بالملابس والموضة..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>نص الإعلان</Label>
                      <Textarea
                        value={newCampaign.ad_text}
                        onChange={(e) => setNewCampaign({...newCampaign, ad_text: e.target.value})}
                        placeholder="النص الإعلاني هنا..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>رابط الصورة</Label>
                      <Input
                        value={newCampaign.image_url}
                        onChange={(e) => setNewCampaign({...newCampaign, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={createNewCampaign} disabled={loading}>
                        {loading ? "جاري الإنشاء..." : "إنشاء الحملة"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewCampaignDialog(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={fetchCampaigns}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">إجمالي الإنفاق</p>
                  <p className="text-3xl font-bold text-green-800">
                    {formatNumber(totalSpend.toString())} جنيه
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">إجمالي النقرات</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {formatNumber(totalClicks.toString())}
                  </p>
                </div>
                <Target className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">مرات الظهور</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {formatNumber(totalImpressions.toString())}
                  </p>
                </div>
                <Eye className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">معدل النقر CTR</p>
                  <p className="text-3xl font-bold text-orange-800">
                    {avgCTR.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Campaigns List */}
        <div className="space-y-6">
          {loading && !campaigns.length ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">جاري تحميل الحملات...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد حملات</h3>
                <p className="text-gray-500 mb-4">ابدأ بإنشاء حملتك الإعلانية الأولى!</p>
                <Button onClick={() => setShowNewCampaignDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء حملة جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
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
                      
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-blue-600 text-xs font-medium">الإنفاق</p>
                          <p className="text-lg font-bold text-blue-800">
                            {formatNumber(campaign.insights?.spend)} ج.م
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-green-600 text-xs font-medium">النقرات</p>
                          <p className="text-lg font-bold text-green-800">
                            {formatNumber(campaign.insights?.clicks)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <p className="text-purple-600 text-xs font-medium">الوصول</p>
                          <p className="text-lg font-bold text-purple-800">
                            {formatNumber(campaign.insights?.impressions)}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg text-center">
                          <p className="text-orange-600 text-xs font-medium">CTR</p>
                          <p className="text-lg font-bold text-orange-800">
                            {campaign.insights?.ctr || '0'}%
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        تم الإنشاء في: {new Date(campaign.created_time).toLocaleDateString('ar-EG')}
                      </p>
                      
                      {(campaign.daily_budget || campaign.lifetime_budget) && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatNumber(campaign.daily_budget || campaign.lifetime_budget || '0')} جنيه
                            {campaign.daily_budget ? '/يوم' : '/إجمالية'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleEditCampaign(campaign)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      تعديل الحملة
                    </Button>
                    
                    <Button
                      onClick={() => optimizeCampaign(campaign.id)}
                      variant="outline"
                      size="sm"
                      disabled={optimizationLoading === campaign.id}
                    >
                      {optimizationLoading === campaign.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          جاري التحسين...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          تحسين ذكي
                        </>
                      )}
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
                      onClick={() => window.open(`https://www.facebook.com/ads/manager/campaigns?act=${process.env.NEXT_PUBLIC_FACEBOOK_AD_ACCOUNT_ID}&campaign_ids=${campaign.id}`, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      فتح في Ads Manager
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الحملة</DialogTitle>
            <DialogDescription>
              يمكنك تعديل إعدادات الحملة من هنا
            </DialogDescription>
          </DialogHeader>
          {editingCampaign && (
            <div className="space-y-4">
              <div>
                <Label>اسم الحملة</Label>
                <Input
                  value={editingCampaign.name}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label>الميزانية اليومية (جنيه)</Label>
                <Input
                  type="number"
                  value={editingCampaign.daily_budget}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    daily_budget: e.target.value
                  })}
                />
              </div>
              <div>
                <Label>حالة الحملة</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingCampaign.status}
                  onChange={(e) => setEditingCampaign({
                    ...editingCampaign,
                    status: e.target.value
                  })}
                >
                  <option value="ACTIVE">نشطة</option>
                  <option value="PAUSED">متوقفة</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveCampaignChanges} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  <X className="w-4 h-4 mr-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}