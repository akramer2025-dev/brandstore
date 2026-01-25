import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MarketingTabs } from "./MarketingTabs";
import { prisma } from "@/lib/prisma";

export default async function MarketingPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [campaigns, keywords, analytics] = await Promise.all([
    prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.seoKeyword.findMany({
      orderBy: { searchVolume: "desc" },
    }),
    prisma.websiteAnalytics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white py-12 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للوحة الإدارة
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold drop-shadow-lg mb-2">
                🚀 التسويق الاحترافي بالذكاء الاصطناعي
              </h1>
              <p className="text-purple-100 text-xl">
                إدارة الحملات • Google Ads • SEO • التحليلات • مساعد AI ذكي
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{campaigns.filter((c: any) => c.status === "ACTIVE").length} حملات نشطة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">{keywords.length} كلمة SEO</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-sm text-purple-100 mb-2">متوسط ROI</p>
                <p className="text-4xl font-bold">
                  {campaigns.length > 0 
                    ? (campaigns.reduce((sum: number, c: any) => sum + c.roi, 0) / campaigns.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <MarketingTabs campaigns={campaigns} keywords={keywords} analytics={analytics} />
      </div>
    </div>
  );
}
