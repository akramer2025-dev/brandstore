"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Settings, Package, Heart, Search, Image as ImageIcon, Upload, Bell, BellOff, LayoutDashboard, MapPin } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductSuggestion {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { items: wishlistItems, notifications, fetchWishlist, fetchNotifications } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Notification states
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [isNotificationSubscribed, setIsNotificationSubscribed] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const handleImageSearch = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/search/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/products?imageSearch=true`);
      }
    } catch (error) {
      console.error('Image search error:', error);
    }
  };

  // البحث عن الاقتراحات
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // إغلاق الاقتراحات عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Check notification support
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsNotificationSupported(true);
      setNotificationPermission(Notification.permission);
      checkNotificationSubscription();
    }
    
    if (session?.user) {
      fetchWishlist();
      fetchNotifications();
      
      // Refresh notifications every 5 minutes
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  const checkNotificationSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsNotificationSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToNotifications = async () => {
    try {
      // طلب الإذن أولاً
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);

      if (perm !== 'granted') {
        alert('⚠️ يجب السماح بالإشعارات من إعدادات المتصفح لتفعيل هذه الميزة');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      setIsNotificationSubscribed(true);

      // إظهار إشعار تجريبي
      registration.showNotification('مرحباً في Remostore! 🎉', {
        body: 'تم تفعيل الإشعارات بنجاح. ستصلك إشعارات بكل جديد!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
      
      alert('✅ تم تفعيل الإشعارات بنجاح!');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      alert('❌ حدث خطأ في تفعيل الإشعارات. تأكد من دعم المتصفح للإشعارات.');
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setIsNotificationSubscribed(false);
        alert('✅ تم إيقاف الإشعارات بنجاح');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('❌ حدث خطأ في إيقاف الإشعارات');
    }
  };

  // إخفاء الـ Header في صفحات الـ vendor والـ admin والـ delivery-dashboard
  if (pathname?.startsWith('/vendor') || pathname?.startsWith('/admin') || pathname?.startsWith('/delivery-dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-teal-500/20">
      <div className="container mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 group">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex-shrink-0 group-hover:scale-110 transition-transform">
              <img 
                src="/logo.png" 
                alt="ريمو ستور - Remo Store" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
              Remostore
            </h1>
          </Link>

          {/* Navigation & Search */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Link href="/" className="text-gray-300 hover:text-cyan-400 transition-colors whitespace-nowrap text-sm">
                الرئيسية
              </Link>
              <Link href="/products" className="text-gray-300 hover:text-cyan-400 transition-colors whitespace-nowrap text-sm">
                المنتجات
              </Link>
              <Link 
                href="/flash-deals" 
                className="text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap font-bold flex items-center gap-1 animate-pulse text-sm"
              >
                ⚡ عروض خاطفة
              </Link>
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
              <div ref={searchRef} className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full pr-10 bg-gray-800/50 border-teal-700/50 text-white placeholder:text-gray-500 focus:border-teal-500 h-9 text-sm"
                />
                
                {/* الاقتراحات المنسدلة */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-teal-700/50 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          router.push(`/products/${product.id}`);
                          setSearchTerm("");
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700 last:border-0"
                      >
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 text-right">
                          <p className="text-white text-sm font-medium">{product.name}</p>
                          <p className="text-teal-400 text-xs">{product.price} جنيه</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* زر البحث بالصورة */}
              <Button 
                type="button"
                size="sm"
                variant="outline"
                onClick={() => imageInputRef.current?.click()}
                className="border-teal-700/50 hover:bg-teal-700/20 text-teal-400 px-3"
                title="البحث بالصورة"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageSearch(file);
                  }
                }}
              />
              
              <Button 
                type="submit" 
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4"
              >
                بحث
              </Button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            {session && (
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-300 hover:text-pink-400 hover:bg-pink-900/30 hover:scale-110 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  {mounted && wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                  {mounted && notifications > 0 && (
                    <span className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </Link>
            )}
            
            {/* Notification Bell */}
            {mounted && isNotificationSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={isNotificationSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
                className={`relative transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 ${
                  isNotificationSubscribed
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 animate-pulse'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/30'
                } hover:scale-110`}
                title={isNotificationSubscribed ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
              >
                {isNotificationSubscribed ? (
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400" />
                ) : (
                  <BellOff className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                {isNotificationSubscribed && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                )}
              </Button>
            )}
            
            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 hover:scale-110 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce-scale" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-teal-500/20">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                    <p className="text-xs text-gray-400">{session.user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-teal-500/20" />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer text-gray-300 hover:text-cyan-400">
                      <Package className="w-4 h-4 mr-2" />
                      طلباتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer text-gray-300 hover:text-pink-400">
                      <Heart className="w-4 h-4 mr-2" />
                      المفضلة
                      {mounted && notifications > 0 && (
                        <span className="mr-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {notifications}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-gray-300 hover:text-cyan-400">
                      <User className="w-4 h-4 mr-2" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/addresses" className="cursor-pointer text-gray-300 hover:text-cyan-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      عناويني
                    </Link>
                  </DropdownMenuItem>
                  {session.user?.role === 'DELIVERY_STAFF' && (
                    <>
                      <DropdownMenuSeparator className="bg-teal-500/20" />
                      <DropdownMenuItem asChild>
                        <Link href="/delivery" className="cursor-pointer text-gray-300 hover:text-cyan-400">
                          <Package className="w-4 h-4 mr-2" />
                          طلبات التوصيل
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {session.user?.role === 'VENDOR' && (
                    <>
                      <DropdownMenuSeparator className="bg-teal-500/20" />
                      <DropdownMenuItem asChild>
                        <Link href="/vendor/dashboard" className="cursor-pointer text-gray-300 hover:text-purple-400">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          لوحة التحكم
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {session.user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator className="bg-teal-500/20" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-gray-300 hover:text-cyan-400">
                          <Settings className="w-4 h-4 mr-2" />
                          لوحة الإدارة
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-teal-500/20" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                  <span className="sm:hidden">دخول</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
