// ⚠️ NOTE: This page requires Auction schema to be in the database
// Before using this page, you MUST run:
// 1. Apply the migration: npx prisma migrate deploy
//    OR run the SQL directly: psql -d your_database -f add-auction-system.sql
// 2. Regenerate Prisma Client: npx prisma generate

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, Plus, Eye, TrendingUp, Timer, Calendar, Users, Tag } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";

export const dynamic = 'force-dynamic';

export default async function AdminAuctionsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch all auctions with related data
  // @ts-ignore - Temporarily ignore until migration is applied
  const auctions = await prisma.auction.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          images: true,
          category: {
            select: {
              name: true,
              nameAr: true
            }
          }
        }
      },
      winner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          bids: true
        }
      }
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  // Statistics
  // @ts-ignore
  const stats = {
    total: auctions.length,
    // @ts-ignore
    active: auctions.filter((a: any) => a.status === 'ACTIVE').length,
    // @ts-ignore
    scheduled: auctions.filter((a: any) => a.status === 'SCHEDULED').length,
    // @ts-ignore
    ended: auctions.filter((a: any) => a.status === 'ENDED').length,
    // @ts-ignore
    sold: auctions.filter((a: any) => a.status === 'SOLD').length,
    // @ts-ignore
    totalBids: auctions.reduce((sum: number, a: any) => sum + a._count.bids, 0),
    // @ts-ignore
    totalRevenue: auctions
      .filter((a: any) => a.status === 'SOLD')
      .reduce((sum: number, a: any) => sum + a.currentPrice, 0)
  };

  // Helper to get time status
  const getTimeStatus = (startDate: Date, endDate: Date, status: string) => {
    const now = new Date();
    
    if (status === 'SOLD' || status === 'CANCELLED' || status === 'NO_SALE') {
      return null;
    }

    if (now < startDate) {
      const diff = startDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return { text: `يبدأ بعد ${days} يوم`, color: 'bg-blue-500' };
    }

    if (now > endDate) {
      return { text: 'انتهى', color: 'bg-red-500' };
    }

    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { text: `${days} يوم ${hours} ساعة`, color: 'bg-green-500' };
    } else if (hours > 0) {
      return { text: `${hours} ساعة`, color: 'bg-yellow-500' };
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return { text: `${minutes} دقيقة`, color: 'bg-orange-500' };
    }
  };

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      SCHEDULED: { label: "مجدول", color: "bg-blue-500" },
      ACTIVE: { label: "نشط", color: "bg-green-500" },
      ENDED: { label: "انتهى", color: "bg-gray-500" },
      SOLD: { label: "تم البيع", color: "bg-purple-500" },
      CANCELLED: { label: "ملغي", color: "bg-red-500" },
      NO_SALE: { label: "لم يباع", color: "bg-orange-500" },
    };

    const config = statusConfig[status] || { label: status, color: "bg-gray-400" };

    return (
      <Badge className={`${config.color} text-white border-0`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <BackButton fallbackUrl="/admin" label="العودة للوحة الإدارة" className="mb-2" />
              <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
                <Gavel className="w-10 h-10" />
                إدارة المزادات
              </h1>
              <p className="text-purple-100 mt-2 text-lg">إجمالي المزادات: {stats.total}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/auctions/new">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl">
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة مزاد جديد
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Auctions */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.active}</span>
              </div>
              <p className="text-green-100 text-sm">مزادات نشطة</p>
            </CardContent>
          </Card>

          {/* Scheduled Auctions */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.scheduled}</span>
              </div>
              <p className="text-blue-100 text-sm">مزادات مجدولة</p>
            </CardContent>
          </Card>

          {/* Total Bids */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.totalBids}</span>
              </div>
              <p className="text-orange-100 text-sm">إجمالي المزايدات</p>
            </CardContent>
          </Card>

          {/* Sold Total */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-8 h-8 opacity-80" />
                <span className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)} ج.م</span>
              </div>
              <p className="text-purple-100 text-sm">إيرادات المزادات</p>
            </CardContent>
          </Card>
        </div>

        {/* Auctions List */}
        {auctions.length === 0 ? (
          <Card className="p-12 text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <Gavel className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد مزادات</h3>
            <p className="text-gray-500 mb-6">ابدأ بإنشاء مزاد جديد</p>
            <Link href="/admin/auctions/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-5 h-5 ml-2" />
                إضافة مزاد جديد
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* @ts-ignore */}
            {auctions.map((auction: any) => {
              const productImage = auction.images[0] || 
                (auction.product.images ? JSON.parse(auction.product.images)[0] : null);
              const timeStatus = getTimeStatus(auction.startDate, auction.endDate, auction.status);

              return (
                <Card key={auction.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                    {/* Image */}
                    <div className="md:col-span-2">
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={auction.titleAr || auction.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Gavel className="w-12 h-12 text-purple-300" />
                          </div>
                        )}
                        {auction.featured && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-500 text-white border-0 text-xs">
                              ⭐
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="md:col-span-6">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {auction.titleAr || auction.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {auction.product.category.nameAr || auction.product.category.name}
                          </p>
                        </div>
                        {getStatusBadge(auction.status)}
                      </div>

                      {timeStatus && (
                        <Badge className={`${timeStatus.color} text-white border-0 text-xs mb-2`}>
                          <Timer className="w-3 h-3 ml-1" />
                          {timeStatus.text}
                        </Badge>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">السعر الحالي</p>
                          <p className="text-lg font-bold text-purple-600">
                            {auction.currentPrice.toFixed(2)} ج.م
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">السعر الابتدائي</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {auction.startingPrice.toFixed(2)} ج.م
                          </p>
                        </div>
                      </div>

                      {auction.buyNowPrice && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">الشراء الفوري</p>
                          <p className="text-lg font-semibold text-green-600">
                            {auction.buyNowPrice.toFixed(2)} ج.م
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats & Winner */}
                    <div className="md:col-span-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4" />
                          <span>{auction._count.bids} مزايدة</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{auction.viewCount} مشاهدة</span>
                        </div>
                        
                        {auction.winner && (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">الفائز</p>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-gray-800">
                                {auction.winner.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <Link href={`/auctions/${auction.id}`} target="_blank">
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 ml-2" />
                          معاينة
                        </Button>
                      </Link>
                      <Link href={`/admin/auctions/${auction.id}/edit`}>
                        <Button variant="outline" className="w-full">
                          تعديل
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 hover:bg-red-50"
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
