"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Key,
  Facebook,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
  Edit,
  Lock,
} from "lucide-react";

interface FacebookSettings {
  accessToken: string;
  adAccountId: string;
  pageId: string;
  hasAccessToken?: boolean;
}

export default function FacebookSettingsPage() {
  const [settings, setSettings] = useState<FacebookSettings>({
    accessToken: "",
    adAccountId: "act_1962278932225",
    pageId: "103042954595602",
  });

  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Load current settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings/facebook");
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          // إذا كان الـ Token موجود، نعتبر أن الإعدادات مكتملة
          if (data.settings.hasAccessToken) {
            setIsConfigured(true);
            setEditMode(false); // وضع القراءة فقط
          } else {
            setEditMode(true); // تفعيل التحرير إذا لم يكن هناك token
          }
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setEditMode(true); // إذا فشل التحميل، نفعل التحرير
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    setTestResult(null);

    try {
      const response = await fetch("/api/settings/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setIsConfigured(true);
        setEditMode(false); // الرجوع لوضع القراءة بعد الحفظ
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error("فشل حفظ الإعدادات");
      }
    } catch (error: any) {
      alert(error.message || "حدث خطأ في حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/facebook/test-connection");
      const data = await response.json();

      setTestResult({
        success: response.ok,
        message: data.message || (response.ok ? "الاتصال ناجح!" : "فشل الاتصال"),
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "حدث خطأ في اختبار الاتصال",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className={isConfigured ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl mb-2">
                  <Facebook className="w-8 h-8" />
                  إعدادات Facebook Marketing API
                </CardTitle>
                <p className="text-white/90">
                  {isConfigured 
                    ? "✅ الإعدادات مكتملة - جاهز للتسويق!" 
                    : "قم بإدخال بيانات الاعتماد للربط مع Facebook Ads Manager"}
                </p>
              </div>
              {isConfigured && (
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {editMode ? (
                    <>
                      <Lock className="w-4 h-4" />
                      وضع القراءة
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      تعديل
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Quick Status Summary */}
        {isConfigured && !editMode && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Access Token</p>
                    <p className="text-sm text-green-700">مفعّل ويعمل</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Ad Account</p>
                    <p className="text-sm text-green-700 font-mono">{settings.adAccountId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Facebook className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Page ID</p>
                    <p className="text-sm text-green-700 font-mono">{settings.pageId}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-center text-green-800 font-semibold">
                  🎉 جاهز للتسويق! يمكنك الآن إنشاء حملات إعلانية من{" "}
                  <a href="/admin/media-buyer" className="underline hover:text-green-900">
                    لوحة التحكم → Media Buyer → كتالوج 🛍️
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        {testResult && (
          <Card className={testResult.success ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${testResult.success ? "text-green-900" : "text-red-900"}`}>
                    {testResult.success ? "✅ الاتصال ناجح" : "❌ فشل الاتصال"}
                  </p>
                  <p className={`text-sm ${testResult.success ? "text-green-700" : "text-red-700"}`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Settings Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                بيانات الاعتماد (Credentials)
              </CardTitle>
              {isConfigured && !editMode && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  مفعّل
                </Badge>
              )}
              {editMode && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Edit className="w-3 h-3 mr-1" />
                  وضع التعديل
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Access Token */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Key className="w-4 h-4" />
                Facebook Access Token *
              </label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={settings.accessToken}
                  onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                  placeholder="EAAWc2Eqq7AO..."
                  className="pr-12 font-mono text-sm"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!editMode && isConfigured && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Token مفعّل ويعمل بنجاح</span>
                </p>
              )}
              {editMode && (
                <p className="text-xs text-gray-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>احصل عليه من Facebook Graph API Explorer أو استخدم refresh-facebook-token.ps1</span>
                </p>
              )}
            </div>

            {/* Ad Account ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="w-4 h-4" />
                Ad Account ID *
              </label>
              <Input
                value={settings.adAccountId}
                onChange={(e) => setSettings({ ...settings, adAccountId: e.target.value })}
                placeholder="act_1234567890"
                className="font-mono text-sm"
                disabled={!editMode}
                readOnly={!editMode}
              />
              {!editMode && isConfigured && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ad Account: {settings.adAccountId}</span>
                </p>
              )}
              {editMode && (
                <p className="text-xs text-gray-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>يبدأ بـ "act_" - اذهب إلى Ads Manager → Settings → Account ID</span>
                </p>
              )}
            </div>

            {/* Page ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Facebook className="w-4 h-4" />
                Facebook Page ID *
              </label>
              <Input
                value={settings.pageId}
                onChange={(e) => setSettings({ ...settings, pageId: e.target.value })}
                placeholder="123456789012345"
                className="font-mono text-sm"
                disabled={!editMode}
                readOnly={!editMode}
              />
              {!editMode && isConfigured && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Page ID: {settings.pageId}</span>
                </p>
              )}
              {editMode && (
                <p className="text-xs text-gray-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>اذهب إلى صفحتك → About → Page ID</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading || !settings.accessToken || !settings.adAccountId || !settings.pageId}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      تم الحفظ!
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>

                {isConfigured && (
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    إلغاء
                  </Button>
                )}
              </div>
            )}

            {/* Test Button (always visible) */}
            <Button
              onClick={handleTest}
              disabled={testing || !settings.accessToken || !settings.adAccountId}
              variant="outline"
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  🧪 اختبار الاتصال
                </>
              )}
            </Button>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-green-900 font-semibold">✅ تم حفظ الإعدادات بنجاح!</p>
                <p className="text-sm text-green-700 mt-1">يمكنك الآن إنشاء حملات إعلانية تلقائياً</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Token Guide */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">📘 كيفية الحصول على Access Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">1</Badge>
                  <span>افتح <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="text-blue-600 underline">Graph API Explorer</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">2</Badge>
                  <span>اختر App: brandstore</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">3</Badge>
                  <span>Generate Access Token مع Permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">4</Badge>
                  <span>انسخ الـ Token واستخدم PowerShell لتحويله لـ Long-lived</span>
                </li>
              </ol>
              <a
                href="/FACEBOOK_TOKEN_GUIDE.md"
                target="_blank"
                className="block mt-3"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  دليل كامل
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Account ID Guide */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base">🆔 كيفية الحصول على Account ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">1</Badge>
                  <span>افتح <a href="https://facebook.com/adsmanager" target="_blank" className="text-purple-600 underline">Facebook Ads Manager</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">2</Badge>
                  <span>اضغط على Settings (⚙️)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">3</Badge>
                  <span>ابحث عن "Account ID"</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 mt-0.5">4</Badge>
                  <span>انسخ الرقم (يبدأ بـ act_)</span>
                </li>
              </ol>
              <p className="text-xs text-purple-700 bg-white rounded p-2 mt-3">
                💡 مثال: <code className="font-mono">act_1234567890</code>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-yellow-50 border-yellow-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-yellow-900">🔒 ملاحظات أمان مهمة:</p>
                <ul className="space-y-1 text-yellow-800">
                  <li>• لا تشارك Access Token مع أي شخص</li>
                  <li>• يتم حفظ البيانات في ملف .env المحلي فقط</li>
                  <li>• يجب تجديد Token كل 60 يوم</li>
                  <li>• استخدم System User Token لتجنب انتهاء الصلاحية</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔗 روابط سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Graph API Explorer</span>
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
              <a
                href="https://facebook.com/adsmanager"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Ads Manager</span>
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
              <a
                href="https://business.facebook.com/settings/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="font-medium">Business Settings</span>
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
