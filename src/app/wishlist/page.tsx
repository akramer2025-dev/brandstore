"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/ProductCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Loader2, AlertCircle, Bell } from "lucide-react";
import Link from "next/link";

interface LowStockNotification {
  id: string;
  product: {
    id: string;
    nameAr: string;
    stock: number;
    price: number;
    images: string | null;
    category: {
      nameAr: string;
    };
  };
  message: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, loading, fetchWishlist } = useWishlist();
  const [notifications, setNotifications] = useState<LowStockNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/wishlist");
      return;
    }

    if (status === "authenticated") {
      fetchWishlist();
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await fetch('/api/wishlist/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-cyan-400 mb-4" />
          <p className="text-gray-300 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                المفضلة
              </h1>
              <p className="text-gray-300">المنتجات التي أضفتها لقائمة المفضلة</p>
            </div>
          </div>
          
          {items.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-300 mt-4">
              <ShoppingBag className="w-4 h-4" />
              <span>لديك {items.length} منتج في المفضلة</span>
            </div>
          )}
        </div>

        {/* Low Stock Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-2 border-orange-500/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 p-2 rounded-full">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-400 mb-2">تنبيه: كمية منخفضة في المخزون!</h3>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between bg-gray-800/60 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-200">{notification.message}</span>
                      </div>
                      <Link href={`/products/${notification.product.id}`}>
                        <Button variant="outline" size="sm" className="text-orange-400 border-orange-500/50 hover:bg-orange-500/20">
                          عرض المنتج
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <Card className="p-12 text-center bg-gray-800/50 border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-100 mb-3">
                قائمة المفضلة فارغة
              </h2>
              <p className="text-gray-300 mb-6">
                لم تقم بإضافة أي منتجات إلى المفضلة بعد
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  تصفح المنتجات
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Products Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
