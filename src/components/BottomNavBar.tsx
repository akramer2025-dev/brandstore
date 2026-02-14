"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Heart, ShoppingBag, ShoppingCart, User } from "lucide-react";
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

  // إخفاء الـ Bottom Nav في صفحات معينة (مثل صفحات الـ Admin)
  const hideNavBarPaths = [
    '/admin',
    '/vendor',
    '/auth/signin',
    '/auth/signup',
  ];

  const shouldHideNavBar = hideNavBarPaths.some(path => pathname.startsWith(path));

  if (shouldHideNavBar) {
    return null;
  }

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
      name: "السلة",
      icon: ShoppingBag,
      href: "/cart",
      isActive: pathname === "/cart",
      color: "from-purple-500 to-pink-500",
      badge: mounted ? totalItems : 0,
      isCenter: true, // الزر المركزي
    },
    {
      name: "المنتجات",
      icon: ShoppingCart,
      href: "/products",
      isActive: pathname === "/products" || pathname.startsWith("/products"),
      color: "from-orange-500 to-amber-500",
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

  return (
    <>
      {/* Spacer لمنع المحتوى من الاختفاء خلف الـ Bottom Nav */}
      <div className="h-20 md:h-0" />
      
      {/* Bottom Navigation Bar - Matching Reference Image */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-gray-200">
        <div className="relative flex items-center justify-around px-4 py-3 max-w-screen-xl mx-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isCenter = item.isCenter;

            if (isCenter) {
              // الزر المركزي - مطابق للصورة المرجعية
              return (
                <div key={item.name} className="flex-1 flex justify-center">
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="relative -mt-8 group"
                    aria-label={item.name}
                  >
                    {/* الخلفية البيضاء الخارجية */}
                    <div className="absolute inset-0 bg-white rounded-full scale-[1.2] shadow-[0_4px_12px_rgba(0,0,0,0.1)]" />
                    
                    {/* الزر الوردي الدائري */}
                    <div 
                      className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 shadow-lg flex items-center justify-center transition-transform duration-200 active:scale-95"
                    >
                      <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                      
                      {/* Badge للعدد */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            }

            // الأزرار العادية - بسيطة ونظيفة
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
                aria-label={item.name}
              >
                {/* الأيقونة */}
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      item.isActive ? 'text-pink-500' : 'text-gray-600'
                    }`}
                    strokeWidth={item.isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge للعدد (للمفضلة) */}
                  {item.badge !== undefined && item.badge > 0 && !isCenter && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* النص */}
                <span 
                  className={`text-[11px] font-medium transition-colors ${
                    item.isActive ? 'text-pink-500' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
