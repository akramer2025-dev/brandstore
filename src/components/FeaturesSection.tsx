"use client";

import { Truck, Shield, Award, CreditCard, Headphones, RefreshCw, Gift, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Truck,
    title: 'شحن سريع',
    description: 'توصيل لجميع المحافظات في أقل من 3 أيام',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-400'
  },
  {
    icon: Shield,
    title: 'ضمان الجودة',
    description: 'جميع المنتجات أصلية 100% مع ضمان الاسترجاع',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-400'
  },
  {
    icon: CreditCard,
    title: 'دفع آمن',
    description: 'طرق دفع متعددة وآمنة - كاش أو أونلاين',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-400'
  },
  {
    icon: Award,
    title: 'منتجات أصلية',
    description: 'نضمن لك الحصول على منتجات أصلية فقط',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400'
  },
  {
    icon: Headphones,
    title: 'دعم 24/7',
    description: 'فريق خدمة عملاء متاح على مدار الساعة',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    iconColor: 'text-teal-400'
  },
  {
    icon: RefreshCw,
    title: 'استرجاع مجاني',
    description: 'إرجاع واستبدال خلال 14 يوم بدون شروط',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-400'
  },
  {
    icon: Gift,
    title: 'نقاط ومكافآت',
    description: 'اكسب نقاط مع كل عملية شراء واستبدلها بخصومات',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400'
  },
  {
    icon: TrendingUp,
    title: 'عروض يومية',
    description: 'خصومات وعروض حصرية كل يوم',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    iconColor: 'text-orange-400'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900/50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 px-6 py-2 rounded-full mb-4 border border-teal-500/30">
            <Award className="w-5 h-5 text-teal-400" />
            <span className="text-teal-300 font-bold text-sm">لماذا تختارنا</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            ✨ مميزات التسوق معنا
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            نوفر لك تجربة تسوق استثنائية بأعلى معايير الجودة والخدمة
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 hover:border-teal-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Line */}
                  <div className={`h-1 w-12 mx-auto rounded-full bg-gradient-to-r ${feature.color} opacity-50 group-hover:opacity-100 group-hover:w-full transition-all duration-300`}></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-block p-6 md:p-8 bg-gradient-to-r from-teal-900/40 via-cyan-900/40 to-teal-900/40 rounded-2xl border border-teal-500/30 backdrop-blur-sm">
            <p className="text-white text-lg md:text-xl font-bold mb-2">
              🎯 جاهز لتجربة تسوق مميزة؟
            </p>
            <p className="text-gray-400 text-sm md:text-base">
              انضم لآلاف العملاء السعداء واستمتع بأفضل العروض
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
