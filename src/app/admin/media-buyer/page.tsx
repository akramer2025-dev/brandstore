import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MediaBuyerTabs } from "./MediaBuyerTabs";
import { prisma } from "@/lib/prisma";

export default async function MediaBuyerPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch campaigns and analytics data
  const [campaigns, analytics, orders] = await Promise.all([
    prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.websiteAnalytics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للوحة الإدارة
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold drop-shadow-lg mb-2">
                🎯 Media Buyer بالذكاء الاصطناعي
              </h1>
              <p className="text-indigo-100 text-xl">
                تحليل الإعلانات • تحسين الحملات • A/B Testing • اقتراحات الميزانية • تحليل الجمهور
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{campaigns.filter((c: any) => c.status === "ACTIVE").length} حملات نشطة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">{orders.length} طلب (آخر 30 يوم)</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-sm text-indigo-100 mb-2">إجمالي الإيرادات</p>
                <p className="text-4xl font-bold">
                  {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('en-US')} ج
                </p>
                <p className="text-xs text-indigo-200 mt-1">آخر 30 يوم</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-sm text-indigo-100 mb-2">إجمالي الإنفاق</p>
                <p className="text-4xl font-bold">
                  {campaigns.reduce((sum: number, c: any) => sum + (c.budget || 0), 0).toLocaleString('en-US')} ج
                </p>
                <p className="text-xs text-indigo-200 mt-1">جميع الحملات</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <MediaBuyerTabs campaigns={campaigns} analytics={analytics} orders={orders} />
      </div>
    </div>
  );
}
