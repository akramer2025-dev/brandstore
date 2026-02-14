"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Target,
  Users,
  DollarSign,
  Calendar,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Package,
  Heart,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoCampaignCreator } from "./AutoCampaignCreator";

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label = "نسخ" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          تم النسخ
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label}
        </>
      )}
    </Button>
  );
}

export function CampaignWizard() {
  const [campaignType, setCampaignType] = useState<"sales" | "traffic" | "awareness" | "catalog">("sales");

  // Campaign objectives and settings
  const campaignObjectives = {
    sales: {
      title: "🛒 حملة مبيعات (Sales Campaign)",
      objective: "المبيعات",
      fbObjective: "OUTCOME_SALES",
      description: "لزيادة المبيعات المباشرة من موقعك",
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600"
    },
    catalog: {
      title: "📦 حملة كتالوج منتجات (Catalog Sales)",
      objective: "مبيعات الكتالوج",
      fbObjective: "OUTCOME_SALES",
      description: "إعلانات ديناميكية لعرض منتجاتك تلقائياً",
      icon: <Package className="w-8 h-8" />,
      color: "from-blue-500 to-indigo-600"
    },
    traffic: {
      title: "🚀 حملة زيارات (Traffic Campaign)",
      objective: "الزيارات",
      fbObjective: "OUTCOME_TRAFFIC",
      description: "لجلب زوار لموقعك أو صفحة معينة",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-500 to-pink-600"
    },
    awareness: {
      title: "📢 حملة وعي بالعلامة (Awareness)",
      objective: "الوعي بالعلامة التجارية",
      fbObjective: "OUTCOME_AWARENESS",
      description: "لنشر علامتك التجارية لأكبر عدد",
      icon: <Sparkles className="w-8 h-8" />,
      color: "from-orange-500 to-yellow-600"
    }
  };

  const currentCampaign = campaignObjectives[campaignType];

  // Audience targeting recommendations
  const audienceTargeting = {
    egypt: {
      locations: "مصر - القاهرة، الجيزة، الإسكندرية، المحافظات الكبرى",
      ages: "25-45 سنة",
      interests: [
        "تسوق أونلاين",
        "الموضة والأزياء",
        "التسوق والأزياء",
        "متاجر الملابس",
        "Shein",
        "الموضة السريعة"
      ],
      behaviors: [
        "مشترون عبر الإنترنت",
        "مستخدمو التسوق عبر الموبايل",
        "المشترون المتكررون"
      ],
      audienceSize: "1-2 مليون شخص (مثالي)"
    }
  };

  // Ad copy suggestions
  const adCopyVariations = {
    sales: [
      {
        title: "🔥 تخفيضات لفترة محدودة!",
        primary: "خصم يصل لـ 50٪ على جميع المنتجات",
        description: "اشتري الآن واحصل على توصيل مجاني! العرض لفترة محدودة ⏰",
        cta: "تسوق الآن"
      },
      {
        title: "✨ أحدث صيحات الموضة",
        primary: "اكتشف تشكيلتنا الجديدة من الملابس العصرية",
        description: "جودة عالية • أسعار مناسبة • توصيل سريع لباب المنزل 🚚",
        cta: "شاهد المجموعة"
      },
      {
        title: "💎 منتجات حصرية بأسعار خيالية",
        primary: "وفر حتى 70٪ على الماركات المفضلة",
        description: "عرض خاص لفترة محدودة! اطلب الآن وادفع عند الاستلام 💳",
        cta: "اطلب الآن"
      }
    ],
    catalog: [
      {
        title: "المنتج المناسب لك 🎯",
        primary: "{{product.name}} - بسعر {{product.price}} ج فقط",
        description: "شاهد المنتجات التي تناسب ذوقك! توصيل لباب المنزل 🚚",
        cta: "عرض المنتج"
      },
      {
        title: "{{product.name}} 🔥",
        primary: "متوفر الآن بسعر خاص {{product.price}} ج",
        description: "منتج عالي الجودة • توصيل سريع • دفع عند الاستلام 💳",
        cta: "اشتري الآن"
      }
    ],
    traffic: [
      {
        title: "🌟 اكتشف متجرنا الإلكتروني",
        primary: "آلاف المنتجات بأفضل الأسعار في مصر",
        description: "تصفح مجموعتنا الكاملة واحصل على عروض حصرية!",
        cta: "زور الموقع"
      }
    ],
    awareness: [
      {
        title: "🎨 Remo Store - وجهتك للتسوق",
        primary: "الموضة العصرية بأسعار تناسب الجميع",
        description: "علامة تجارية موثوقة • منتجات عالية الجودة • خدمة عملاء ممتازة",
        cta: "تعرف علينا"
      }
    ]
  };

  // Budget recommendations
  const budgetRecommendations = {
    starter: {
      label: "مبتدئ",
      daily: "50-100 ج/يوم",
      total: "1,500-3,000 ج/شهر",
      reach: "5,000-10,000 شخص/يوم",
      description: "مناسب للبدء وقياس النتائج"
    },
    standard: {
      label: "قياسي",
      daily: "150-300 ج/يوم",
      total: "4,500-9,000 ج/شهر",
      reach: "15,000-30,000 شخص/يوم",
      description: "خيار متوازن للحملات المتوسطة"
    },
    aggressive: {
      label: "مكثف",
      daily: "500-1,000 ج/يوم",
      total: "15,000-30,000 ج/شهر",
      reach: "50,000-100,000 شخص/يوم",
      description: "للحملات الكبيرة والنتائج السريعة"
    }
  };

  // Placement recommendations
  const placements = {
    automatic: {
      label: "توزيع تلقائي (موصى به)",
      description: "Facebook و Instagram تلقائياً",
      platforms: ["Facebook Feed", "Instagram Feed", "Stories", "Reels", "Messenger"]
    },
    manual: {
      label: "توزيع يدوي",
      recommended: [
        { name: "Facebook Feed", priority: "عالي", icon: "📱" },
        { name: "Instagram Feed", priority: "عالي", icon: "📸" },
        { name: "Instagram Stories", priority: "متوسط", icon: "⭐" },
        { name: "Facebook Stories", priority: "متوسط", icon: "📖" },
        { name: "Instagram Reels", priority: "عالي", icon: "🎬" }
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Type Selection */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            اختر نوع الحملة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(campaignObjectives).map(([key, campaign]) => (
              <button
                key={key}
                onClick={() => setCampaignType(key as any)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  campaignType === key
                    ? "border-purple-500 bg-white shadow-lg scale-105"
                    : "border-gray-200 bg-white/50 hover:border-purple-300"
                }`}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${campaign.color} flex items-center justify-center text-white mb-3 mx-auto`}>
                  {campaign.icon}
                </div>
                <h3 className="font-bold text-sm mb-2">{campaign.title}</h3>
                <p className="text-xs text-gray-600">{campaign.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="auto-create" className="w-full">
        <TabsList className="grid w-full grid-cols-7 gap-1">
          <TabsTrigger value="auto-create" className="text-xs sm:text-sm">
            <Zap className="w-4 h-4 ml-1" />
            <span className="hidden sm:inline">إنشاء تلقائي</span>
            <span className="sm:hidden">تلقائي</span>
          </TabsTrigger>
          <TabsTrigger value="pixel" className="text-xs sm:text-sm">📊 Pixel</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">⚙️ إعدادات</TabsTrigger>
          <TabsTrigger value="audience" className="text-xs sm:text-sm">👥 جمهور</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs sm:text-sm">💰 ميزانية</TabsTrigger>
          <TabsTrigger value="creative" className="text-xs sm:text-sm">✍️ نصوص</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs sm:text-sm">📋 ملخص</TabsTrigger>
        </TabsList>

        {/* Auto-Create Tab - NEW FIRST TAB */}
        <TabsContent value="auto-create" className="space-y-4">
          <AutoCampaignCreator />
        </TabsContent>

        {/* Facebook Pixel Tab - NEW */}
        <TabsContent value="pixel" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                ⚠️ مطلوب: Facebook Pixel للتتبع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Why Pixel is Needed */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900 mb-2">
                      لماذا يطلب Facebook الـ Pixel؟
                    </h3>
                    <p className="text-red-800 mb-3">
                      Facebook بيحتاج الـ Pixel عشان يقدر يتتبع:
                    </p>
                    <ul className="space-y-2 text-red-800">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>مين اللي زار موقعك من الإعلان</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>مين اللي اشترى منتج (Conversion)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>مين ضاف منتج للسلة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>تحسين الإعلانات تلقائياً للناس اللي بتشتري</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mt-4">
                  <p className="text-sm font-bold text-red-900">
                    ⚠️ بدون Pixel: Facebook مش هيعرف أي إعلان نجح أو فشل!
                  </p>
                </div>
              </div>

              {/* How to Get Pixel */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  خطوات إنشاء Facebook Pixel
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-lg mb-2">الخطوة 1️⃣ اذهب إلى Events Manager</p>
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                        facebook.com/events_manager2
                      </code>
                      <CopyButton text="https://facebook.com/events_manager2" label="نسخ الرابط" />
                    </div>
                    <p className="text-sm text-gray-600">
                      أو من Business Settings → Data Sources → Pixels
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-lg mb-2">الخطوة 2️⃣ اضغط "Add" → اختر "Pixel"</p>
                    <p className="text-sm text-gray-600">
                      اكتب اسم للـ Pixel مثل: "Remostore Pixel"
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-lg mb-2">الخطوة 3️⃣ اختر "Set up the Pixel Now"</p>
                    <p className="text-sm text-gray-600 mb-2">
                      اختر: <strong>"Manually add pixel code to website"</strong>
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-lg mb-2">الخطوة 4️⃣ انسخ كود الـ Pixel</p>
                    <p className="text-sm text-gray-600 mb-3">
                      هيديك كود شبه كده:
                    </p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
{`<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel Code -->`}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-lg mb-2">الخطوة 5️⃣ أرسل الكود للمطور</p>
                    <p className="text-sm text-gray-600 mb-3">
                      المطور هيحط الكود ده في ملف <code className="bg-gray-100 px-2 py-0.5 rounded">layout.tsx</code>
                    </p>
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                      <p className="text-sm text-yellow-900">
                        💡 <strong>ملحوظة:</strong> الموقع محتاج تعديل من المطور لإضافة كود الـ Pixel
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Temporary Solution */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-5">
                <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                  حل مؤقت: ابدأ بدون Pixel (للتجربة فقط)
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-800 mb-3">
                      إذا كنت عايز تجرب الإعلان بسرعة بدون تعقيد:
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">1.</span>
                        <span>اختر <strong>"حركة المرور" (Traffic)</strong> بدلاً من "مبيعات"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">2.</span>
                        <span>الهدف: جلب زوار للموقع فقط (لا يحتاج Pixel)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-orange-600">3.</span>
                        <span>بعدين لما تركب الـ Pixel، حول الحملة لـ "مبيعات"</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-900 font-semibold">
                      ⚠️ تحذير: حملات "المبيعات" بدون Pixel مش هتشتغل كويس!
                    </p>
                    <p className="text-xs text-red-800 mt-1">
                      Facebook مش هيعرف يحسن الإعلانات عشان يجيبلك عملاء بيشتروا
                    </p>
                  </div>
                </div>
              </div>

              {/* Pixel Benefits */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-5">
                <h3 className="text-xl font-bold text-purple-900 mb-4">
                  ✨ فوائد الـ Pixel بعد التركيب
                </h3>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold text-purple-900 mb-1">🎯 إعادة الاستهداف</p>
                    <p className="text-xs text-gray-600">
                      ظهور إعلانك للناس اللي زارت الموقع ومشتراش
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold text-purple-900 mb-1">🤖 تحسين تلقائي</p>
                    <p className="text-xs text-gray-600">
                      Facebook يوصل للناس الأكثر احتمالاً للشراء
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold text-purple-900 mb-1">📊 تقارير دقيقة</p>
                    <p className="text-xs text-gray-600">
                      تعرف كل طلب جاي من أيconversion tracking
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold text-purple-900 mb-1">💰 توفير المال</p>
                    <p className="text-xs text-gray-600">
                      Facebook يوقف الإعلانات الفاشلة تلقائياً
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">🔗 روابط مفيدة</h3>
                <div className="space-y-2">
                  <a
                    href="https://facebook.com/events_manager2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-3 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-semibold text-blue-600">Events Manager →</p>
                    <p className="text-sm text-gray-600">لإنشاء وإدارة الـ Pixel</p>
                  </a>
                  
                  <a
                    href="https://www.facebook.com/business/help/952192354843755"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-3 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-semibold text-blue-600">دليل Facebook Pixel →</p>
                    <p className="text-sm text-gray-600">شرح رسمي من Facebook</p>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                إعدادات الحملة - انقل هذه القيم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Objective */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">1️⃣ هدف الحملة (Campaign Objective)</h3>
                    <p className="text-sm text-gray-600">اختر هذا من القائمة المنسدلة في Facebook</p>
                  </div>
                  <CopyButton text={currentCampaign.objective} />
                </div>
                <div className="bg-white rounded-lg p-3 font-mono text-lg font-bold text-indigo-600">
                  {currentCampaign.objective}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  📌 في Facebook Ads Manager: اختر "{currentCampaign.objective}" من خطوة "اختيار الهدف"
                </p>
              </div>

              {/* Campaign Name */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">2️⃣ اسم الحملة</h3>
                    <p className="text-sm text-gray-600">اكتب هذا الاسم في خانة "اسم الحملة"</p>
                  </div>
                  <CopyButton text={`Remo Store - ${currentCampaign.objective} - ${new Date().toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}`} />
                </div>
                <div className="bg-white rounded-lg p-3 font-mono text-base">
                  Remo Store - {currentCampaign.objective} - {new Date().toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Special Campaign Settings */}
              {campaignType === "catalog" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-1">⚠️ إعدادات خاصة بحملة الكتالوج</h3>
                      <p className="text-sm text-gray-600 mb-3">تأكد من تطبيق هذه الإعدادات:</p>
                      
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">✅ فعّل "Advantage+ catalog ads"</p>
                            <Badge variant="secondary">موصى به</Badge>
                          </div>
                          <p className="text-xs text-gray-600">يساعد في تحسين اختيار المنتجات تلقائياً</p>
                        </div>

                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold mb-2">📦 اختر مصدر الكتالوج:</p>
                          <div className="flex items-center justify-between">
                            <code className="text-sm bg-gray-100 px-3 py-1 rounded">Remo Store Product Catalog</code>
                            <CopyButton text="https://www.remostore.net/api/products/feed" label="نسخ رابط Feed" />
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3">
                          <p className="font-semibold mb-2">🎯 نوع الإعلان:</p>
                          <p className="text-sm">اختر: <code className="bg-gray-100 px-2 py-1 rounded">Advantage+ catalog ads</code></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversion Location */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">3️⃣ موقع التحويل</h3>
                    <p className="text-sm text-gray-600">اختر "موقع إلكتروني" (Website)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-semibold mb-1">النطاق (Domain):</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm">www.remostore.net</code>
                      <CopyButton text="www.remostore.net" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-semibold mb-1">حدث التحويل (Conversion Event):</p>
                    <p className="text-sm">اختر: <code className="bg-gray-100 px-2 py-1 rounded">Purchase</code> (عملية شراء)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                استهداف الجمهور - القيم الموصى بها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Locations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">📍 المواقع الجغرافية</h3>
                    <p className="text-sm text-gray-600">اكتب هذه الأماكن في خانة "المواقع"</p>
                  </div>
                  <CopyButton text={audienceTargeting.egypt.locations} />
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-mono text-sm">{audienceTargeting.egypt.locations}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 يمكنك إضافة أو إزالة محافظات حسب احتياجك
                </p>
              </div>

              {/* Age Range */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">🎂 العمر</h3>
                    <p className="text-sm text-gray-600">حدد هذا النطاق العمري</p>
                  </div>
                  <CopyButton text={audienceTargeting.egypt.ages} />
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-mono text-lg font-bold text-center">{audienceTargeting.egypt.ages}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 الفئة العمرية الأكثر شراءً للملابس أونلاين
                </p>
              </div>

              {/* Detailed Targeting - Interests */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">❤️ الاهتمامات (Interests)</h3>
                    <p className="text-sm text-gray-600">اكتب هذه الكلمات في "الاستهداف التفصيلي"</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {audienceTargeting.egypt.interests.map((interest, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                      <span className="font-medium">{interest}</span>
                      <CopyButton text={interest} />
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">نسخ الكل (منفصل بفواصل):</span>
                    <CopyButton text={audienceTargeting.egypt.interests.join(", ")} />
                  </div>
                </div>
              </div>

              {/* Behaviors */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">🛍️ السلوكيات (Behaviors)</h3>
                    <p className="text-sm text-gray-600">أضف هذه السلوكيات للاستهداف</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {audienceTargeting.egypt.behaviors.map((behavior, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                      <span className="font-medium">{behavior}</span>
                      <CopyButton text={behavior} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Size Indicator */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-lg">حجم الجمهور المتوقع</h3>
                    <p className="text-2xl font-bold text-indigo-600">{audienceTargeting.egypt.audienceSize}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      ✅ حجم مثالي - لا صغير ولا كبير جداً
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                توصيات الميزانية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(budgetRecommendations).map(([key, budget]) => (
                  <div key={key} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <Badge className="mb-3">{budget.label}</Badge>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">الميزانية اليومية</p>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-green-600">{budget.daily}</p>
                          <CopyButton text={budget.daily} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المجموع الشهري</p>
                        <p className="text-lg font-semibold">{budget.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الوصول المتوقع</p>
                        <p className="text-base font-medium">{budget.reach}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{budget.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bid Strategy */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">💡 استراتيجية المزايدة (Bid Strategy)</h3>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Highest volume (موصى به للمبتدئين)</p>
                        <p className="text-sm text-gray-600">Facebook يحاول الحصول على أكبر عدد من التحويلات</p>
                      </div>
                      <Badge variant="secondary">موصى به</Badge>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold">Cost per result (متقدم)</p>
                    <p className="text-sm text-gray-600">تحديد تكلفة مستهدفة لكل تحويل</p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">📅 الجدولة</h3>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-semibold mb-2">⏰ أفضل أوقات التشغيل:</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-sm font-semibold">أيام الأسبوع</p>
                        <p className="text-xs">8 مساءً - 12 منتصف الليل</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-sm font-semibold">عطلات نهاية الأسبوع</p>
                        <p className="text-xs">12 ظهراً - 2 صباحاً</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      💡 للبداية: اترك الحملة تعمل 24/7 ثم حلل النتائج
                    </p>
                  </div>
                </div>
              </div>

              {/* Placements */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">📱 مواضع الإعلان (Placements)</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">✅ {placements.automatic.label}</p>
                      <Badge variant="default">الأفضل</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{placements.automatic.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {placements.automatic.platforms.map((platform, idx) => (
                        <Badge key={idx} variant="outline">{platform}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold mb-2">أو اختر يدوياً (متقدم):</p>
                    <div className="space-y-1">
                      {placements.manual.recommended.map((place, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{place.icon} {place.name}</span>
                          <Badge variant={place.priority === "عالي" ? "default" : "secondary"}>
                            {place.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creative Tab */}
        <TabsContent value="creative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                نصوص الإعلانات - جاهزة للنسخ واللصق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {adCopyVariations[campaignType]?.map((adCopy, idx) => (
                <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="text-base px-3 py-1">نسخة {idx + 1}</Badge>
                    <Button
                      onClick={() => {
                        const fullText = `${adCopy.title}\n\n${adCopy.primary}\n\n${adCopy.description}`;
                        navigator.clipboard.writeText(fullText);
                      }}
                      variant="default"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      نسخ النص كامل
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Headline */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-600">العنوان الرئيسي (Headline):</p>
                        <CopyButton text={adCopy.title} />
                      </div>
                      <p className="text-xl font-bold">{adCopy.title}</p>
                    </div>

                    {/* Primary Text */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-600">النص الأساسي (Primary Text):</p>
                        <CopyButton text={adCopy.primary} />
                      </div>
                      <p className="text-lg">{adCopy.primary}</p>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-600">الوصف (Description):</p>
                        <CopyButton text={adCopy.description} />
                      </div>
                      <p className="text-base">{adCopy.description}</p>
                    </div>

                    {/* CTA */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-600">زر الحث على اتخاذ إجراء (CTA Button):</p>
                        <CopyButton text={adCopy.cta} />
                      </div>
                      <Button className="w-full" size="lg">
                        {adCopy.cta}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Additional Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  نصائح للنصوص الإعلانية
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>استخدم الأيموجي لجذب الانتباه (لكن لا تكثر)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>اذكر العرض بوضوح (خصم، توصيل مجاني، إلخ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>أضف إحساس بالاستعجال (فترة محدودة، عرض خاص)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>اجعل زر CTA واضح ومباشر</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    <span>تجنب المبالغات الكاذبة أو الوعود الغير واقعية</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                ملخص الحملة - جاهز للتطبيق
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Reference Checklist */}
              <div className="bg-white rounded-xl p-5 shadow-lg">
                <h3 className="text-xl font-bold mb-4">📋 قائمة مراجعة سريعة</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">نوع الحملة: {currentCampaign.title}</p>
                      <p className="text-sm text-gray-600">الهدف: {currentCampaign.objective}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">الجمهور: {audienceTargeting.egypt.audienceSize}</p>
                      <p className="text-sm text-gray-600">الموقع: {audienceTargeting.egypt.locations}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">الميزانية المقترحة: 50-300 ج/يوم</p>
                      <p className="text-sm text-gray-600">حسب حجم الحملة والأهداف</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">نصوص الإعلان: {adCopyVariations[campaignType]?.length || 0} نسخ جاهزة</p>
                      <p className="text-sm text-gray-600">للنسخ واللصق مباشرة</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-green-600" />
                  الخطوات التالية
                </h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    <div>
                      <p className="font-semibold">افتح Facebook Ads Manager</p>
                      <p className="text-sm text-gray-700">اذهب إلى facebook.com/adsmanager</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    <div>
                      <p className="font-semibold">اضغط "إنشاء" → اختر الهدف</p>
                      <p className="text-sm text-gray-700">اختر: "{currentCampaign.objective}"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </span>
                    <div>
                      <p className="font-semibold">انسخ إعدادات الجمهور</p>
                      <p className="text-sm text-gray-700">من تبويب "الجمهور" أعلاه</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      4
                    </span>
                    <div>
                      <p className="font-semibold">حدد الميزانية والجدولة</p>
                      <p className="text-sm text-gray-700">من تبويب "الميزانية" أعلاه</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      5
                    </span>
                    <div>
                      <p className="font-semibold">انسخ نصوص الإعلان</p>
                      <p className="text-sm text-gray-700">من تبويب "النصوص" أعلاه</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      6
                    </span>
                    <div>
                      <p className="font-semibold">ارفع الصور/الفيديو</p>
                      <p className="text-sm text-gray-700">اختر صور عالية الجودة لمنتجاتك</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      7
                    </span>
                    <div>
                      <p className="font-semibold">راجع واطلق الحملة! 🚀</p>
                      <p className="text-sm text-gray-700">تحقق من كل شيء ثم اضغط "نشر"</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Important Links */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">🔗 روابط مهمة</h3>
                <div className="space-y-2">
                  <a
                    href="https://facebook.com/adsmanager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-3 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-semibold text-blue-600">Facebook Ads Manager →</p>
                    <p className="text-sm text-gray-600">لإنشاء وإدارة الحملات</p>
                  </a>
                  {campaignType === "catalog" && (
                    <a
                      href="/admin/product-catalog"
                      className="block bg-white rounded-lg p-3 hover:bg-blue-50 transition-colors"
                    >
                      <p className="font-semibold text-blue-600">كتالوج المنتجات →</p>
                      <p className="text-sm text-gray-600">لربط الكتالوج بالحملة</p>
                    </a>
                  )}
                  <a
                    href="https://business.facebook.com/commerce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-3 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-semibold text-blue-600">Commerce Manager →</p>
                    <p className="text-sm text-gray-600">لإدارة كتالوج المنتجات</p>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
