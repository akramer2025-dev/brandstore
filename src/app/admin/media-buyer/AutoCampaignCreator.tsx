"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  ExternalLink,
  Link as LinkIcon,
  Image as ImageIcon,
  MessageSquare,
  DollarSign,
  Target,
  Settings,
} from "lucide-react";

interface CampaignData {
  name: string;
  objective: string;
  budget: number;
  targetUrl: string;
  adMessage: string;
  adTitle: string;
  adDescription: string;
  imageUrl: string;
}

interface FacebookResponse {
  success: boolean;
  facebook?: {
    campaignId: string;
    adSetId: string;
    adId: string;
  };
  error?: string;
}

export function AutoCampaignCreator() {
  const [formData, setFormData] = useState<CampaignData>({
    name: "",
    objective: "OUTCOME_TRAFFIC",
    budget: 100,
    targetUrl: "https://www.remostore.net",
    adMessage: "",
    adTitle: "",
    adDescription: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FacebookResponse | null>(null);
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(null);

  // Campaign objectives
  const objectives = [
    { value: "OUTCOME_TRAFFIC", label: "🚀 زيارات (Traffic)", description: "جلب زوار للموقع" },
    { value: "OUTCOME_SALES", label: "🛒 مبيعات (Sales)", description: "زيادة المبيعات المباشرة" },
    { value: "OUTCOME_AWARENESS", label: "📢 وعي (Awareness)", description: "نشر العلامة التجارية" },
    { value: "OUTCOME_ENGAGEMENT", label: "💬 تفاعل (Engagement)", description: "زيادة التفاعل مع المحتوى" },
  ];

  // Budget tiers
  const budgetTiers = [
    { value: 50, label: "50 ج/يوم - مبتدئ", reach: "5,000-10,000" },
    { value: 100, label: "100 ج/يوم - قياسي", reach: "10,000-20,000" },
    { value: 200, label: "200 ج/يوم - متقدم", reach: "20,000-40,000" },
    { value: 500, label: "500 ج/يوم - مكثف", reach: "50,000-100,000" },
  ];

  // Sample ad templates
  const adTemplates = [
    {
      title: "🔥 تخفيضات لفترة محدودة!",
      message: "خصم يصل لـ 50٪ على جميع المنتجات! اشتري الآن واحصل على توصيل مجاني. العرض لفترة محدودة ⏰",
      description: "جودة عالية • أسعار مناسبة • توصيل سريع لباب المنزل",
    },
    {
      title: "✨ أحدث صيحات الموضة",
      message: "اكتشف تشكيلتنا الجديدة من الملابس العصرية بأسعار تناسب الجميع! توصيل سريع لباب المنزل 🚚",
      description: "منتجات حصرية • جودة عالية • خدمة عملاء ممتازة",
    },
    {
      title: "💎 منتجات حصرية بأسعار خيالية",
      message: "وفر حتى 70٪ على الماركات المفضلة! عرض خاص لفترة محدودة. اطلب الآن وادفع عند الاستلام 💳",
      description: "تسوق آمن • دفع عند الاستلام • إرجاع مجاني",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSavedCampaignId(null);

    try {
      // 1. Create campaign in database first
      console.log("📝 Creating campaign in database...");
      const dbResponse = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: "FACEBOOK",
          budget: formData.budget,
          status: "DRAFT",
        }),
      });

      if (!dbResponse.ok) {
        throw new Error("فشل في حفظ الحملة في قاعدة البيانات");
      }

      const dbData = await dbResponse.json();
      const campaignId = dbData.id;
      setSavedCampaignId(campaignId);
      console.log("✅ Campaign saved in DB with ID:", campaignId);

      // 2. Create campaign on Facebook
      console.log("🚀 Creating campaign on Facebook...");
      const fbResponse = await fetch("/api/marketing/facebook/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          targetUrl: formData.targetUrl,
          adMessage: formData.adMessage,
          adTitle: formData.adTitle,
          adDescription: formData.adDescription,
          imageUrl: formData.imageUrl,
        }),
      });

      const fbData: FacebookResponse = await fbResponse.json();

      if (!fbResponse.ok) {
        throw new Error(fbData.error || "حدث خطأ في إنشاء الحملة على Facebook");
      }

      setResult(fbData);
      console.log("✅ Campaign created successfully!", fbData);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      setResult({
        success: false,
        error: error.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: typeof adTemplates[0]) => {
    setFormData({
      ...formData,
      adTitle: template.title,
      adMessage: template.message,
      adDescription: template.description,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Zap className="w-8 h-8" />
            إنشاء حملة إعلانية تلقائياً
          </CardTitle>
          <p className="text-white/90 text-base">
            املأ البيانات وسنقوم بإنشاء الحملة على Facebook مباشرة بضغطة زر واحدة! 🚀
          </p>
        </CardHeader>
      </Card>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Name & Objective */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات الحملة الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                اسم الحملة *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: حملة الشتاء 2026"
                className="text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                هدف الحملة *
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {objectives.map((obj) => (
                  <button
                    key={obj.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, objective: obj.value })}
                    className={`p-4 rounded-lg border-2 text-right transition-all ${
                      formData.objective === obj.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <p className="font-semibold text-sm">{obj.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{obj.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              الميزانية اليومية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              {budgetTiers.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, budget: tier.value })}
                  className={`p-4 rounded-lg border-2 text-right transition-all ${
                    formData.budget === tier.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <p className="font-semibold">{tier.label}</p>
                  <p className="text-xs text-gray-600 mt-1">الوصول: {tier.reach} شخص/يوم</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                أو أدخل مبلغ مخصص (ج/يوم)
              </label>
              <Input
                type="number"
                min="10"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 50 })}
                className="text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ad Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              محتوى الإعلان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Templates */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                اختر قالب جاهز (اختياري)
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                {adTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => loadTemplate(template)}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-right"
                  >
                    <p className="font-semibold text-sm">{template.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{template.message}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                عنوان الإعلان *
              </label>
              <Input
                required
                value={formData.adTitle}
                onChange={(e) => setFormData({ ...formData, adTitle: e.target.value })}
                placeholder="مثال: 🔥 تخفيضات لفترة محدودة!"
                className="text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                النص الأساسي *
              </label>
              <Textarea
                required
                value={formData.adMessage}
                onChange={(e) => setFormData({ ...formData, adMessage: e.target.value })}
                placeholder="مثال: خصم يصل لـ 50٪ على جميع المنتجات! اشتري الآن واحصل على توصيل مجاني..."
                rows={4}
                className="text-base"
              />
              <p className="text-xs text-gray-600 mt-1">
                الطول الحالي: {formData.adMessage.length} حرف (موصى به: 125-150)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                الوصف (اختياري)
              </label>
              <Input
                value={formData.adDescription}
                onChange={(e) => setFormData({ ...formData, adDescription: e.target.value })}
                placeholder="مثال: جودة عالية • أسعار مناسبة • توصيل سريع"
                className="text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              الروابط والصور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                رابط الصفحة المستهدفة *
              </label>
              <Input
                required
                type="url"
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                placeholder="https://www.remostore.net"
                className="text-base"
              />
              <p className="text-xs text-gray-600 mt-1">
                الرابط الذي سيتم توجيه الزوار إليه عند الضغط على الإعلان
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                رابط صورة الإعلان (اختياري)
              </label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="text-base"
              />
              <p className="text-xs text-gray-600 mt-1">
                إذا تركته فارغاً، سيتم استخدام صورة افتراضية
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.adTitle || !formData.adMessage}
              className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  جاري إنشاء الحملة على Facebook...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  إنشاء الحملة الآن على Facebook
                </>
              )}
            </Button>

            {!formData.name || !formData.adTitle || !formData.adMessage ? (
              <p className="text-center text-sm text-gray-600 mt-3">
                ⚠️ يرجى ملء جميع الحقول المطلوبة (*)
              </p>
            ) : null}
          </CardContent>
        </Card>
      </form>

      {/* Result Display */}
      {result && (
        <Card className={result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-green-900">تم إنشاء الحملة بنجاح! 🎉</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-900">حدث خطأ</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success && result.facebook ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Campaign ID:</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {result.facebook.campaignId}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">AdSet ID:</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {result.facebook.adSetId}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Ad ID:</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {result.facebook.adId}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/adsmanager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      افتح Ads Manager
                    </Button>
                  </a>
                  {savedCampaignId && (
                    <a
                      href={`/admin/campaign-manager?id=${savedCampaignId}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        عرض تفاصيل الحملة
                      </Button>
                    </a>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">📌 الخطوات التالية:</p>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>✅ تم إنشاء الحملة على Facebook</li>
                    <li>✅ تم حفظ بيانات الحملة في قاعدة البيانات</li>
                    <li>🔄 راجع الحملة في Ads Manager للتأكد من الإعدادات</li>
                    <li>📊 تابع الأداء من صفحة "إدارة الحملات"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4">
                <p className="text-red-900 font-semibold mb-2">رسالة الخطأ:</p>
                <p className="text-sm text-red-800 bg-red-50 p-3 rounded">
                  {result.error}
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p className="font-semibold">💡 حلول محتملة:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>تأكد من تجديد Facebook Access Token</li>
                    <li>تحقق من صحة Facebook Ad Account ID</li>
                    <li>راجع صفحة إعدادات Facebook للتأكد من الربط</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">💡 نصائح للحملة الناجحة</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>استخدم عنواناً جذاباً مع emoji لجذب الانتباه</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>اجعل النص واضحاً ومختصراً (125-150 حرف)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>استخدم صورة عالية الجودة (1200x628 بكسل)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>ابدأ بميزانية صغيرة واختبر النتائج</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>راقب الأداء يومياً وعدّل الإعدادات حسب الحاجة</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
