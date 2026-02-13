"use client";

import { useState } from "react";
import { ArrowLeft, Languages } from "lucide-react";
import Link from "next/link";
import { MarketingTabs } from "./MarketingTabs";
import { Button } from "@/components/ui/button";

const translations = {
  ar: {
    backToDashboard: "العودة للوحة الإدارة",
    title: "🚀 التسويق الاحترافي بالذكاء الاصطناعي",
    subtitle: "إدارة الحملات • Google Ads • SEO • التحليلات • مساعد AI ذكي",
    activeCampaigns: "حملات نشطة",
    seoKeywords: "كلمة SEO",
    avgRoi: "متوسط ROI",
  },
  en: {
    backToDashboard: "Back to Dashboard",
    title: "🚀 Professional AI Marketing",
    subtitle: "Campaign Management • Google Ads • SEO • Analytics • AI Assistant",
    activeCampaigns: "Active Campaigns",
    seoKeywords: "SEO Keywords",
    avgRoi: "Avg ROI",
  },
};

interface MarketingPageClientProps {
  campaigns: any[];
  keywords: any[];
  analytics: any[];
}

export function MarketingPageClient({ campaigns, keywords, analytics }: MarketingPageClientProps) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE").length;
  const avgRoi =
    campaigns.length > 0
      ? (campaigns.reduce((sum: number, c: any) => sum + c.roi, 0) / campaigns.length).toFixed(0)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-700 via-pink-700 to-rose-700 text-white py-12 shadow-2xl border-b border-purple-500/30">
        <div className="container mx-auto px-4">
          {/* Top Bar with Back and Language Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t.backToDashboard}
            </Link>
            <Button
              onClick={toggleLanguage}
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white gap-2 border border-white/20"
            >
              <Languages className="w-4 h-4" />
              {language === "ar" ? "English" : "عربي"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold drop-shadow-lg mb-2">{t.title}</h1>
              <p className="text-purple-200 text-xl">{t.subtitle}</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {activeCampaigns} {t.activeCampaigns}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <span className="text-sm font-medium">
                    {keywords.length} {t.seoKeywords}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-sm text-purple-100 mb-2">{t.avgRoi}</p>
                <p className="text-4xl font-bold">{avgRoi}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <MarketingTabs 
          campaigns={campaigns} 
          keywords={keywords} 
          analytics={analytics}
          language={language}
        />
      </div>
    </div>
  );
}
