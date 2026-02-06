"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FlashDealsPage() {
  const [flashDeals, setFlashDeals] = useState([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-yellow-400">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-white">العروض الخاطفة</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl">
            <Zap className="w-8 h-8 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold">عروض خاطفة ⚡</h1>
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-gray-300 text-lg">
            عروض محدودة لفترة قصيرة - لا تفوت الفرصة!
          </p>
        </div>

        {/* Flash Deals Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
          </div>
        ) : flashDeals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Zap className="w-24 h-24 mx-auto text-gray-500 mb-6" />
            <h3 className="text-2xl text-white mb-2">لا توجد عروض خاطفة حالياً</h3>
            <p className="text-gray-400 mb-8">تابعنا لمعرفة آخر العروض</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                تصفح جميع المنتجات
              </Button>
            </Link>
          </div>
        )}

        {/* CTA Section */}
        {flashDeals.length > 0 && (
          <div className="mt-16 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-yellow-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              لا تفوت العروض المميزة!
            </h2>
            <p className="text-gray-300 mb-8">
              اشترك في النشرة الإخبارية لتصلك آخر العروض والخصومات
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg px-8 py-6">
                <Sparkles className="w-5 h-5 ml-2" />
                استكشف المزيد
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
