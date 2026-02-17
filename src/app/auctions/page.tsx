"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Gavel, Timer, TrendingUp, Users, Eye } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Auction {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  startDate: string;
  endDate: string;
  status: string;
  featured: boolean;
  images: string[];
  viewCount: number;
  bidCount: number;
  product: {
    id: string;
    name: string;
    nameAr: string | null;
    images: string | null;
  };
  winner: {
    id: string;
    name: string | null;
  } | null;
  _count: {
    bids: number;
  };
}

interface AuctionResponse {
  success: boolean;
  auctions: Auction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Helper function to calculate time remaining
const getTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: "انتهى المزاد", color: "bg-red-500", expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days} يوم و ${hours} ساعة`, color: "bg-green-500", expired: false };
  } else if (hours > 0) {
    return { text: `${hours} ساعة و ${minutes} دقيقة`, color: "bg-yellow-500", expired: false };
  } else {
    return { text: `${minutes} دقيقة`, color: "bg-orange-500", expired: false };
  }
};

// Helper function to get status badge
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

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuctions();
  }, [statusFilter, featuredOnly, currentPage]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (featuredOnly) params.append('featured', 'true');
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/auctions?${params.toString()}`);
      const data: AuctionResponse = await response.json();

      if (data.success) {
        setAuctions(data.auctions);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-12 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/" label="العودة للرئيسية" className="mb-4" />
          <div className="flex items-center justify-center gap-4 mb-4">
            <Gavel className="w-16 h-16 animate-bounce" />
            <div className="text-center">
              <h1 className="text-5xl font-bold drop-shadow-lg">المزادات</h1>
              <p className="text-purple-100 mt-2 text-lg">شارك في المزايدة واربح أفضل الصفقات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                {["ACTIVE", "SCHEDULED", "ENDED", "SOLD"].map((status) => (
                  <Button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    variant={statusFilter === status ? "default" : "outline"}
                    className={statusFilter === status ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {status === "ACTIVE" && "نشط"}
                    {status === "SCHEDULED" && "مجدول"}
                    {status === "ENDED" && "منتهي"}
                    {status === "SOLD" && "مباع"}
                  </Button>
                ))}
              </div>

              {/* Featured Toggle */}
              <Button
                onClick={() => {
                  setFeaturedOnly(!featuredOnly);
                  setCurrentPage(1);
                }}
                variant={featuredOnly ? "default" : "outline"}
                className={featuredOnly ? "bg-pink-600 hover:bg-pink-700" : ""}
              >
                ⭐ مميز فقط
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : auctions.length === 0 ? (
          <Card className="p-12 text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <Gavel className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد مزادات</h3>
            <p className="text-gray-500">لا توجد مزادات متاحة حالياً</p>
          </Card>
        ) : (
          <>
            {/* Auctions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {auctions.map((auction) => {
                const timeRemaining = getTimeRemaining(auction.endDate);
                const productImage = auction.images[0] || (auction.product.images ? JSON.parse(auction.product.images)[0] : null);

                return (
                  <Link href={`/auctions/${auction.id}`} key={auction.id}>
                    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden cursor-pointer">
                      {/* Image */}
                      <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                        {auction.featured && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-yellow-500 text-white border-0 text-sm px-3 py-1">
                              ⭐ مميز
                            </Badge>
                          </div>
                        )}
                        
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={auction.titleAr || auction.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Gavel className="w-20 h-20 text-purple-300" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          {getStatusBadge(auction.status)}
                        </div>
                      </div>

                      <CardContent className="p-5">
                        {/* Title */}
                        <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {auction.titleAr || auction.title}
                        </h3>

                        {/* Time Remaining */}
                        {auction.status === "ACTIVE" && !timeRemaining.expired && (
                          <div className="flex items-center gap-2 mb-3">
                            <Timer className="w-4 h-4 text-orange-500" />
                            <Badge className={`${timeRemaining.color} text-white border-0 text-xs`}>
                              {timeRemaining.text}
                            </Badge>
                          </div>
                        )}

                        {/* Prices */}
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">السعر الحالي:</span>
                            <span className="text-2xl font-bold text-purple-600">
                              {auction.currentPrice.toFixed(2)} ج.م
                            </span>
                          </div>
                          {auction.buyNowPrice && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">اشترِ الآن:</span>
                              <span className="text-lg font-semibold text-green-600">
                                {auction.buyNowPrice.toFixed(2)} ج.م
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{auction._count.bids} مزايدة</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{auction.viewCount} مشاهدة</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                          <Gavel className="w-4 h-4 ml-2" />
                          {auction.status === "ACTIVE" ? "شارك في المزايدة" : "عرض التفاصيل"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  السابق
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
