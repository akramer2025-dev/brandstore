"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Settings, Package, Heart, Search, Image as ImageIcon, Upload, Bell, BellOff, LayoutDashboard, MapPin, Wallet, Coins } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
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
  const { clearCart, setUserId } = useCartStore();
  const { items: wishlistItems, notifications, fetchWishlist, fetchNotifications } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<Array<{top: number; left: number; size: number; opacity: number; duration: number; delay: number}>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  
  // Wallet/Balance state
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [couponsCount, setCouponsCount] = useState<number>(0);
  
  // Notification states
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [isNotificationSubscribed, setIsNotificationSubscribed] = useState(false);
  
  const handleLogout = async () => {
    // مسح السلة عند تسجيل الخروج
    clearCart();
    setUserId(null);
    await signOut();
  };

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

  // إغلاق البحث في الموبايل عند الضغط على Escape وتركيز على input
  useEffect(() => {
    if (isMobileSearchOpen) {
      // Focus on input after animation
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileSearchOpen(false);
          setSearchTerm("");
          setShowSuggestions(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      // منع السكرول في الخلفية
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    setMounted(true);
    
    // توليد النجوم على الكلاينت فقط
    setStars(
      Array.from({ length: 12 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 2 + 1.5,
        delay: Math.random() * 3,
      }))
    );
    
    // Check notification support
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsNotificationSupported(true);
      setNotificationPermission(Notification.permission);
      checkNotificationSubscription();
    }
    
    if (session?.user) {
      fetchWishlist();
      fetchNotifications();
      fetchWalletBalance();
      
      // Refresh notifications every 5 minutes
      const interval = setInterval(() => {
        fetchNotifications();
        fetchWalletBalance();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  // جلب رصيد الكوبونات
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/user/coupons');
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.totalBalance || 0);
        setCouponsCount(data.availableCouponsCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

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
      registration.showNotification('مرحباً في Remo Store! 🎉', {
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

  // إخفاء الـ Header في صفحات الـ vendor والـ admin والـ delivery-dashboard والـ developer
  if (pathname?.startsWith('/vendor') || pathname?.startsWith('/admin') || pathname?.startsWith('/delivery-dashboard') || pathname?.startsWith('/developer')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 backdrop-blur-sm border-b border-purple-300/20 overflow-hidden">
      {/* نجوم متحركة */}
      {mounted && stars.length > 0 && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {stars.map((star, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: `${star.top}%`,
                left: `${star.left}%`,
                opacity: star.opacity,
                animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
      <div className="container mx-auto px-2 sm:px-4 py-1 relative z-10">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-shrink-0 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/logo.png" 
                alt="ريمو ستور - Remo Store" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-white tracking-tight drop-shadow-2xl whitespace-nowrap group-hover:text-purple-100 transition-all duration-300">
              Remo Store
            </h1>
          </Link>

          {/* Navigation & Search */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Link href="/" className="text-gray-300 hover:text-cyan-400 transition-colors whitespace-nowrap text-xs">
                الرئيسية
              </Link>
              <Link href="/products" className="text-gray-300 hover:text-cyan-400 transition-colors whitespace-nowrap text-xs">
                المنتجات
              </Link>
              <Link 
                href="/flash-deals" 
                className="text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap font-bold flex items-center gap-1 animate-pulse text-xs"
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
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 hover:scale-110 transition-all duration-300 w-7 h-7"
            >
              <Search className="w-3 h-3 animate-pulse" />
            </Button>
            
            {/* Wishlist */}
            {session && (
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-300 hover:text-pink-400 hover:bg-pink-900/30 hover:scale-110 transition-all duration-300 w-7 h-7 sm:w-8 sm:h-8"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
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
            
            {/* Notifications */}
            {session && (
              <NotificationsDropdown role={session.user?.role} />
            )}
            
            {/* Notification Bell - Push Notifications */}
            {mounted && isNotificationSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={isNotificationSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
                className={`relative transition-all duration-300 w-7 h-7 sm:w-8 sm:h-8 ${
                  isNotificationSubscribed
                    ? 'text-green-400 hover:text-green-300 hover:bg-green-900/30'
                    : 'text-gray-500 hover:text-gray-400 hover:bg-gray-700/30'
                }`}
                title={isNotificationSubscribed ? 'إيقاف الإشعارات الفورية' : 'تفعيل الإشعارات الفورية'}
              >
                {isNotificationSubscribed ? (
                  <Bell className="w-3 h-3 sm:w-3 sm:h-3 fill-green-400" />
                ) : (
                  <BellOff className="w-3 h-3 sm:w-3 sm:h-3" />
                )}
                {isNotificationSubscribed && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
              </Button>
            )}
            
            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 hover:scale-110 transition-all duration-300 w-7 h-7 sm:w-8 sm:h-8"
              >
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce-scale" />
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
                    className="text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 w-7 h-7 sm:w-8 sm:h-8"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-teal-500/20">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                    <p className="text-xs text-gray-400">{session.user?.email}</p>
                  </div>
                  
                  {/* عرض الرصيد */}
                  {mounted && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile/wallet" className="cursor-pointer">
                        <div className="w-full py-1 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-md px-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-400" />
                              <span className="text-xs text-gray-200 font-medium">رصيد الخصومات</span>
                            </div>
                            <span className="text-sm font-bold text-amber-400">
                              {walletBalance.toFixed(0)} ج
                            </span>
                          </div>
                          {couponsCount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {couponsCount} كوبون متاح • اضغط للتفاصيل
                            </p>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
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
                  {session.user?.role === 'DEVELOPER' && (
                    <>
                      <DropdownMenuSeparator className="bg-teal-500/20" />
                      <DropdownMenuItem asChild>
                        <Link href="/developer" className="cursor-pointer text-gray-300 hover:text-purple-400">
                          <Settings className="w-4 h-4 mr-2" />
                          👨‍💻 لوحة المطور
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-teal-500/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
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
      
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900/98 backdrop-blur-md animate-in fade-in duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchTerm("");
                  setShowSuggestions(false);
                }}
                className="text-gray-300 hover:text-red-400 hover:bg-red-900/30 shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5" />
                  <Input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 h-12 bg-gray-800/80 border-2 border-teal-500/50 text-white placeholder:text-gray-400 focus:border-cyan-400 text-base rounded-xl shadow-lg shadow-cyan-500/20"
                  />
                </div>
                
                <Button 
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-teal-500/50 hover:bg-teal-700/30 text-cyan-400 w-12 h-12 shrink-0 rounded-xl"
                  title="البحث بالصورة"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 h-12 shrink-0 rounded-xl shadow-lg shadow-cyan-500/30"
                >
                  بحث
                </Button>
              </form>
            </div>
            
            {/* Mobile Search Suggestions */}
            {searchTerm.trim().length >= 2 && suggestions.length > 0 && (
              <div className="bg-gray-800/90 border-2 border-teal-500/30 rounded-xl shadow-2xl max-h-[calc(100vh-120px)] overflow-y-auto backdrop-blur-sm">
                <div className="p-2">
                  <p className="text-gray-400 text-xs px-3 py-2 font-medium">النتائج المقترحة:</p>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        router.push(`/products/${product.id}`);
                        setSearchTerm("");
                        setShowSuggestions(false);
                        setIsMobileSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-teal-900/40 hover:to-cyan-900/40 transition-all duration-200 rounded-lg mb-2 active:scale-95"
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1 text-right">
                        <p className="text-white text-sm font-medium mb-1">{product.name}</p>
                        <p className="text-cyan-400 text-base font-bold">{product.price} جنيه</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {searchTerm.trim().length >= 2 && suggestions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg font-medium">لا توجد نتائج</p>
                <p className="text-gray-500 text-sm mt-1">حاول البحث بكلمات أخرى</p>
              </div>
            )}
            
            {/* Hints */}
            {searchTerm.trim().length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-600/20 to-cyan-600/20 rounded-full flex items-center justify-center animate-pulse">
                  <Search className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">ابحث عن منتجاتك المفضلة</h3>
                <p className="text-gray-400 text-sm mb-6">أدخل اسم المنتج أو الفئة أو العلامة التجارية</p>
                
                <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                  {['تيشيرتات', 'أحذية', 'مستحضرات تجميل', 'اكسسوارات', 'ذهب'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setSearchTerm(keyword)}
                      className="px-4 py-2 bg-gray-800/50 hover:bg-teal-600/30 text-gray-300 hover:text-cyan-400 rounded-full text-sm border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-200 active:scale-95"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
