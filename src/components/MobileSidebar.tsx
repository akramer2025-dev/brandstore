"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Home,
  ShoppingBag,
  Heart,
  User,
  Package,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingCart,
  Star,
  Tags,
  MessageSquare,
  Bell,
  Wallet,
  MapPin,
  Phone,
  Info,
  Gift,
  Sparkles,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { clearCart, setUserId } = useCartStore();
  const { items: wishlistItems } = useWishlist();
  const [mounted, setMounted] = useState(false);

  // Mount check for Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes only if it's open
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    clearCart();
    setUserId(null);
    await signOut({ callbackUrl: "/" });
  };

  const menuSections = [] as Array<{
    title: string;
    items: Array<{
      icon: any;
      label: string;
      href: string;
      color: string;
      authRequired?: boolean;
      badge?: number;
      isSpecial?: boolean;
    }>;
  }>;

  // إضافة قسم خاص للمدير أو الشريك في الأعلى
  if (session?.user?.role === "ADMIN") {
    menuSections.push({
      title: "⭐ لوحة الإدارة",
      items: [
        {
          icon: LayoutDashboard,
          label: "🎯 لوحة التحكم الرئيسية",
          href: "/admin",
          color: "text-violet-600",
          isSpecial: true,
        },
        {
          icon: TrendingUp,
          label: "📊 تحليل الإعلان الممول",
          href: "/admin/ad-campaign",
          color: "text-cyan-600",
        },
        {
          icon: Wallet,
          label: "📄 اتفاقيات التقسيط",
          href: "/admin/installment-agreements",
          color: "text-purple-600",
        },
      ],
    });
  } else if (session?.user?.role === "VENDOR") {
    menuSections.push({
      title: "⭐ لوحة الشريك",
      items: [
        {
          icon: LayoutDashboard,
          label: "🎯 لوحة التحكم",
          href: "/vendor/dashboard",
          color: "text-violet-600",
          isSpecial: true,
        },
        {
          icon: TrendingUp,
          label: "📈 الإحصائيات",
          href: "/vendor/analytics",
          color: "text-cyan-600",
        },
      ],
    });
  }

  // القائمة الرئيسية
  menuSections.push(
    {
      title: "القائمة الرئيسية",
      items: [
        { icon: Home, label: "الرئيسية", href: "/", color: "text-purple-500" },
        { icon: ShoppingBag, label: "المنتجات", href: "/products", color: "text-orange-500" },
        { icon: Tags, label: "التصنيفات", href: "/categories", color: "text-pink-500" },
        { icon: Gift, label: "العروض الخاصة", href: "/offers", color: "text-red-500" },
      ],
    },
    {
      title: "حسابي",
      items: [
        { icon: User, label: "الملف الشخصي", href: "/profile", color: "text-blue-500", authRequired: true },
        { icon: Package, label: "طلباتي", href: "/orders", color: "text-green-500", authRequired: true },
        { icon: Heart, label: "المفضلة", href: "/wishlist", color: "text-pink-500", badge: wishlistItems.length },
        { icon: ShoppingCart, label: "السلة", href: "/cart", color: "text-purple-500", badge: totalItems },
        { icon: Wallet, label: "المحفظة", href: "/profile/wallet", color: "text-emerald-500", authRequired: true },
      ],
    }
  );

  // Support & Info section
  menuSections.push({
    title: "الدعم والمساعدة",
    items: [
      { icon: Phone, label: "اتصل بنا", href: "/contact", color: "text-teal-500" },
      { icon: MessageSquare, label: "المحادثة", href: "/chat", color: "text-cyan-500" },
      { icon: Info, label: "من نحن", href: "/about", color: "text-indigo-500" },
      { icon: Star, label: "التقييمات", href: "/reviews", color: "text-yellow-500" },
    ],
  });

  // لا نعرض شيء حتى يتم التحميل على العميل
  if (!mounted) return null;

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{
          zIndex: 99998,
          opacity: isOpen ? 1 : 0,
          display: isOpen ? 'block' : 'none'
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 bottom-0 w-72 max-w-[75vw] bg-white shadow-2xl transition-all duration-300 ease-out overflow-y-auto"
        style={{
          left: isOpen ? '0' : '-100%',
          zIndex: 99999
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-6 shadow-lg">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {session?.user ? (
              <div className="mt-2">
                <div className="flex items-center gap-3 mb-2">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-lg">{session.user.name}</h3>
                    <p className="text-white/80 text-xs">{session.user.email}</p>
                  </div>
                </div>
                {session.user.role && (
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-semibold">
                    {session.user.role === "ADMIN" ? "مدير" : session.user.role === "PARTNER" ? "بائع" : "عميل"}
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <h3 className="text-white font-bold text-xl mb-2">مرحباً بك! 👋</h3>
                <p className="text-white/90 text-sm">سجل الدخول للحصول على تجربة أفضل</p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            {menuSections.map((section, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    // Skip auth-required items if not logged in
                    if (item.authRequired && !session?.user) return null;

                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500"
                            : item.isSpecial
                            ? "bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-2 border-violet-200"
                            : "hover:bg-gray-100/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? item.color : item.isSpecial ? item.color : "text-gray-600"}`} />
                        <span
                          className={`flex-1 font-medium ${
                            isActive ? "text-purple-600" : item.isSpecial ? item.color : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-4 bg-white/50 backdrop-blur">
            {session?.user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold transition-all duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  إنشاء حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // استخدام Portal لإخراج الـ Sidebar من الـ Header ووضعه في body
  return createPortal(sidebarContent, document.body);
}
