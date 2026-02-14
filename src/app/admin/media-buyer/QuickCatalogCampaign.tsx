"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Loader2, Rocket, ShoppingBag } from "lucide-react";

export function QuickCatalogCampaign() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "حملة كتالوج ريمو ستور",
    budget: 50,
    message: "اكتشفي أحدث صيحات الموضة! 🛍️✨\nتسوقي الآن من ريمو ستور\nتوصيل لجميع أنحاء مصر 🚚",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Create Dynamic Product Ads Campaign
      const response = await fetch('/api/marketing/facebook/create-catalog-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          budget: formData.budget,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء الحملة');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          إنشاء حملة كتالوج سريعة
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          إعلان ذكي لكل منتجاتك في دقيقتين 🚀
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campaign Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم الحملة</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="حملة كتالوج ريمو ستور"
          />
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-medium">الميزانية اليومية (جنيه)</label>
          <Input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            placeholder="50"
            min="20"
          />
          <p className="text-xs text-muted-foreground">
            موصى به: 50-200 جنيه/يوم
          </p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">نص الإعلان</label>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="اكتشفي أحدث صيحات الموضة..."
            rows={4}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">✨ الحملة ستشمل تلقائياً:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ جميع المنتجات من الكتالوج</li>
            <li>✅ استهداف: مصر (18-65 سنة)</li>
            <li>✅ المنصات: Facebook + Instagram</li>
            <li>✅ الأماكن: Feed + Stories + Reels</li>
            <li>✅ التحسين: للمبيعات (Conversions)</li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.name || formData.budget < 20}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري إنشاء الحملة...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              إطلاق الحملة الآن! 🚀
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">فشل إنشاء الحملة</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes('credentials') && (
                <p className="text-xs text-red-600 mt-2">
                  💡 تأكد من إضافة Facebook Access Token في الإعدادات
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">تم إنشاء الحملة بنجاح! 🎉</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign ID:</span>
                    <span className="font-mono">{result.campaignId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span>{formData.budget} ج.م/يوم</span>
                  </div>
                </div>

                {result.facebookCampaignId && (
                  <div className="mt-4">
                    <a
                      href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=1962278932225&selected_campaign_ids=${result.facebookCampaignId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      عرض في Facebook Ads Manager →
                    </a>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-muted-foreground">
                    📊 راجع الأداء بعد 24-48 ساعة
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
