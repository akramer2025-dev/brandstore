"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Heart, ShoppingBag, ShoppingCart, User, Gift } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useState, useEffect } from "react";

export function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { items: wishlistItems } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: "الرئيسية",
      icon: Home,
      href: "/",
      isActive: pathname === "/",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "المفضلة",
      icon: Heart,
      href: "/wishlist",
      isActive: pathname === "/wishlist",
      color: "from-pink-500 to-red-500",
      badge: mounted ? wishlistItems.length : 0,
    },
    {
      name: "العروض",
      icon: Gift,
      href: "/offers",
      isActive: pathname === "/offers",
      color: "from-red-500 via-orange-500 to-amber-500",
      isCenter: true, // الزر المركزي
    },
    {
      name: "السلة",
      icon: ShoppingCart,
      href: "/cart",
      isActive: pathname === "/cart",
      color: "from-orange-500 to-amber-500",
      badge: mounted ? totalItems : 0,
    },
    {
      name: "حسابي",
      icon: User,
      href: "/profile",
      isActive: pathname === "/profile",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // إخفاء الـ Bottom Nav في صفحات معينة
  const hideNavBarPaths = [
    '/admin',
    '/vendor',
    '/auth/login',
    '/auth/register',
  ];
  
  const shouldHideNavBar = hideNavBarPaths.some(path => pathname.startsWith(path));

  if (shouldHideNavBar) {
    return null;
  }

  return (
    <>
      {/* Spacer لمنع المحتوى من الاختفاء خلف الـ Bottom Nav */}
      <div className="h-20 md:h-0" />
      
      {/* Bottom Navigation Bar - تصميم احترافي محسّن */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* خلفية الـ Blur */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"></div>
        
        <div className="relative flex items-center justify-around px-6 py-2.5 max-w-screen-xl mx-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isCenter = item.isCenter;

            if (isCenter) {
              // الزر المركزي - تصميم متميز وجذاب (العروض الخاصة)
              return (
                <div key={item.name} className="flex-1 flex justify-center">
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="relative -mt-5 group"
                    aria-label={item.name}
                  >
                    {/* الخلفية البيضاء الكبيرة */}
                    <div className="absolute inset-0 bg-white rounded-full scale-[1.15] shadow-[0_0_0_6px_rgba(255,255,255,1),0_6px_12px_rgba(0,0,0,0.1)]" />
                    
                    {/* الزر الملون الدائري - العروض الخاصة */}
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 shadow-[0_3px_12px_rgba(239,68,68,0.4)] flex items-center justify-center transition-all duration-300 active:scale-95 group-hover:shadow-[0_4px_16px_rgba(239,68,68,0.6)]">
                      <Icon className="w-6 h-6 text-white drop-shadow-md" strokeWidth={2.5} />
                      
                      {/* تأثير التوهج */}
                      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </button>
                </div>
              );
            }

            // الأزرار العادية - تصميم نظيف وأنيق
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-1 relative group"
                aria-label={item.name}
              >
                {/* الأيقونة مع تأثير الـ Active */}
                <div className="relative">
                  {/* خلفية ملونة للـ Active State */}
                  {item.isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full scale-150 -z-10"></div>
                  )}
                  
                  <Icon 
                    className={`w-5 h-5 transition-all duration-200 ${
                      item.isActive 
                        ? 'text-purple-600 scale-110' 
                        : 'text-gray-500 group-hover:text-purple-500 group-hover:scale-105'
                    }`}
                    strokeWidth={item.isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge للعدد */}
                  {item.badge !== undefined && item.badge > 0 && !isCenter && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-3.5 px-0.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md ring-1 ring-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* النص */}
                <span 
                  className={`text-[9px] font-semibold transition-colors duration-200 ${
                    item.isActive 
                      ? 'text-purple-600' 
                      : 'text-gray-500 group-hover:text-purple-500'
                  }`}
                >
                  {item.name}
                </span>
                
                {/* خط مؤشر للـ Active State */}
                {item.isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-sm"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
