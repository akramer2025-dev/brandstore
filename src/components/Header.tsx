"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Settings, Package, Heart, Search, Image as ImageIcon, Upload, Bell, BellOff, LayoutDashboard, MapPin, Wallet, Coins, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { MobileSidebar } from "@/components/MobileSidebar";
import { AdvancedSearch } from "@/components/AdvancedSearch";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
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

  // إخفاء الـ Header في صفحات الـ vendor والـ admin والـ delivery-dashboard والـ developer والـ chat
  if (pathname?.startsWith('/vendor') || pathname?.startsWith('/admin') || pathname?.startsWith('/delivery-dashboard') || pathname?.startsWith('/developer') || pathname?.startsWith('/chat')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 backdrop-blur-sm border-b border-purple-300/20">
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

          {/* Navigation */}
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
            
            {/* Advanced Search Button - Desktop */}
            <div className="hidden sm:flex flex-1 justify-center">
              <Button
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 h-10 rounded-xl font-bold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2 group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">بحث متقدم</span>
                <span className="md:hidden">بحث</span>
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Advanced Search Button - Mobile */}
            <Button
              onClick={() => setIsAdvancedSearchOpen(true)}
              variant="ghost"
              size="icon"
              className="sm:hidden text-gray-300 hover:text-cyan-400 hover:bg-cyan-900/50 hover:scale-110 transition-all duration-300 w-9 h-9 relative"
            >
              <Search className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
              className="md:hidden text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 hover:scale-110 transition-all duration-300 w-9 h-9"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Wishlist - مخفي على الموبايل */}
            {session && (
              <Link href="/wishlist" className="hidden md:block">
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
            
            {/* Notifications - مخفي على الموبايل */}
            <div className="hidden md:block">
              {session && (
                <NotificationsDropdown role={session.user?.role} />
              )}
            </div>
            
            {/* Notification Bell - مخفي حالياً */}
            {false && mounted && isNotificationSupported && (
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
            
            {/* Cart - مخفي على الموبايل */}
            <Link href="/cart" className="hidden md:block">
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

            {/* User Menu - يظهر فقط على الديسكتوب */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-gray-300 hover:text-cyan-400 hover:bg-teal-900/50 w-7 h-7 sm:w-8 sm:h-8"
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
                  {session.user?.role === 'VEHICLE_DEALER' && (
                    <>
                      <DropdownMenuSeparator className="bg-teal-500/20" />
                      <DropdownMenuItem asChild>
                        <Link href="/vehicle-dealer/dashboard" className="cursor-pointer text-gray-300 hover:text-blue-400">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          🚗 لوحة معرض السيارات
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
              <Link href="/auth/login" className="hidden md:block">
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

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Advanced Search Modal */}
      <AdvancedSearch 
        isOpen={isAdvancedSearchOpen} 
        onClose={() => setIsAdvancedSearchOpen(false)} 
      />
    </header>
  );
}
