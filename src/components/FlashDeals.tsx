"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Star, Clock, TrendingUp } from "lucide-react";

interface FlashDeal {
  id: string;
  nameAr: string;
  price: number;
  originalPrice: number | null;
  images: string | null;
  soldCount: number;
  stock: number;
  flashDealEndsAt: string | null;
  reviews: { rating: number }[];
}

export default function FlashDeals() {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashDeals();
  }, []);

  const fetchFlashDeals = async () => {
    try {
      const res = await fetch("/api/products/flash-deals");
      if (!res.ok) {
        console.error("Failed to fetch flash deals:", res.status);
        setFlashDeals([]);
        return;
      }
      
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setFlashDeals(data);
      } else {
        console.error("Flash deals response is not an array:", data);
        setFlashDeals([]);
      }
    } catch (error) {
      console.error("Error fetching flash deals:", error);
      setFlashDeals([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || flashDeals.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl animate-bounce-scale">
          <Zap className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">⚡ عروض خاطفة</h2>
          <p className="text-gray-400">عروض محدودة لفترة قصيرة</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {flashDeals.map((product) => (
          <FlashDealCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function FlashDealCard({ product }: { product: FlashDeal }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!product.flashDealEndsAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(product.flashDealEndsAt!).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [product.flashDealEndsAt]);

  const firstImage = product.images?.split(',')[0]?.trim() || '/placeholder.jpg';
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  const stockWarning = product.stock < 20;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-gray-800/80 border-2 border-yellow-500/50 hover:border-yellow-500 transition-all cursor-pointer group relative overflow-hidden">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
            ‪-{discount}%‬
          </div>
        )}

        {/* Flash Deal Badge */}
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1 animate-pulse">
          <Zap className="w-3 h-3" />
          عرض خاطف
        </div>

        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-900">
          <Image
            src={firstImage}
            alt={product.nameAr}
            fill            sizes="(max-width: 768px) 50vw, 33vw"            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors min-h-[3.5rem]">
            {product.nameAr}
          </h3>

          {/* Rating & Sales */}
          <div className="flex items-center justify-between text-sm">
            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500">({product.reviews.length})</span>
              </div>
            )}
            {product.soldCount > 0 && (
              <div className="flex items-center gap-1 text-teal-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{product.soldCount.toLocaleString()}+ مبيعات</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-400">
                {product.price.toLocaleString()} جنيه
              </span>
            </div>
            {product.originalPrice && (
              <div className="text-gray-500 line-through text-sm">
                السعر الأصلي {product.originalPrice.toLocaleString()} جنيه
              </div>
            )}
          </div>

          {/* Stock Warning */}
          {stockWarning && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-1 text-center">
              <span className="text-red-400 font-bold text-sm">
                ⚠️ الكمية المتبقية: {product.stock} فقط
              </span>
            </div>
          )}

          {/* Countdown Timer */}
          {timeLeft && (
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 text-xs font-medium">ينتهي في</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <div className="text-white font-bold text-lg">{timeLeft.days}</div>
                  <div className="text-gray-400 text-xs">يوم</div>
                </div>
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <div className="text-white font-bold text-lg">{timeLeft.hours}</div>
                  <div className="text-gray-400 text-xs">ساعة</div>
                </div>
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <div className="text-white font-bold text-lg">{timeLeft.minutes}</div>
                  <div className="text-gray-400 text-xs">دقيقة</div>
                </div>
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <div className="text-white font-bold text-lg">{timeLeft.seconds}</div>
                  <div className="text-gray-400 text-xs">ثانية</div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold">
            <Zap className="w-4 h-4 ml-2" />
            اشتر الآن
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
