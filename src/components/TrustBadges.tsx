'use client';

import { Shield, CheckCircle, Truck, CreditCard, RotateCcw, Lock } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: '100% آمن',
      subtitle: 'SSL Secure',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: CheckCircle,
      title: 'منتجات أصلية',
      subtitle: '100% Authentic',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Truck,
      title: 'شحن سريع',
      subtitle: 'Fast Delivery',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: CreditCard,
      title: 'دفع آمن',
      subtitle: 'Secure Payment',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: RotateCcw,
      title: 'استرجاع مجاني',
      subtitle: '14 Days Return',
      color: 'from-teal-500 to-green-600',
    },
    {
      icon: Lock,
      title: 'حماية البيانات',
      subtitle: 'Data Protection',
      color: 'from-indigo-500 to-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            <div className={`bg-gradient-to-r ${badge.color} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-white text-xs md:text-sm font-semibold text-center mb-0.5">
              {badge.title}
            </h3>
            <p className="text-gray-400 text-[10px] md:text-xs text-center">
              {badge.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Compact version for footer
export function TrustBadgesCompact() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-5 h-5 text-green-400" />
        <span className="text-gray-300">SSL Secure</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="w-5 h-5 text-blue-400" />
        <span className="text-gray-300">100% Original</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Truck className="w-5 h-5 text-purple-400" />
        <span className="text-gray-300">Fast Shipping</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <RotateCcw className="w-5 h-5 text-teal-400" />
        <span className="text-gray-300">14 Days Return</span>
      </div>
    </div>
  );
}
