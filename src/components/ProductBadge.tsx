"use client";

import { Sparkles, TrendingUp, Zap, Award } from "lucide-react";

interface ProductBadgeProps {
  badge: string | null;
  soldCount?: number;
  className?: string;
}

export default function ProductBadge({ badge, soldCount = 0, className = "" }: ProductBadgeProps) {
  if (!badge && soldCount < 100) return null;

  // تحديد الشارة المناسبة
  let badgeConfig = {
    text: "",
    icon: null as React.ReactNode,
    gradient: "",
  };

  if (badge === "جديد" || badge === "new") {
    badgeConfig = {
      text: "جديد",
      icon: <Sparkles className="w-3 h-3" />,
      gradient: "from-green-500 to-emerald-500",
    };
  } else if (badge === "الأكثر مبيعاً" || badge === "bestseller" || soldCount >= 100) {
    badgeConfig = {
      text: "الأكثر مبيعاً",
      icon: <TrendingUp className="w-3 h-3" />,
      gradient: "from-purple-500 to-pink-500",
    };
  } else if (badge === "خصم" || badge === "sale") {
    badgeConfig = {
      text: "خصم",
      icon: <Zap className="w-3 h-3" />,
      gradient: "from-red-500 to-orange-500",
    };
  } else if (badge === "محدود" || badge === "limited") {
    badgeConfig = {
      text: "كمية محدودة",
      icon: <Award className="w-3 h-3" />,
      gradient: "from-yellow-500 to-amber-500",
    };
  } else if (badge) {
    // شارة مخصصة
    badgeConfig = {
      text: badge,
      icon: <Award className="w-3 h-3" />,
      gradient: "from-teal-500 to-cyan-500",
    };
  }

  return (
    <div
      className={`absolute top-3 right-3 z-10 bg-gradient-to-r ${badgeConfig.gradient} text-white font-bold px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1 animate-pulse ${className}`}
    >
      {badgeConfig.icon}
      {badgeConfig.text}
    </div>
  );
}
