import { Sparkles, Shield, Truck, HeadphonesIcon, Award, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "من نحن - ريمو ستور",
  description: "تعرف على ريمو ستور - متجرك الإلكتروني الموثوق للتسوق",
};

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: "جودة مضمونة",
      description: "نختار منتجاتنا بعناية لضمان أعلى مستويات الجودة",
    },
    {
      icon: Truck,
      title: "توصيل سريع",
      description: "نوفر خدمة توصيل سريعة لجميع المحافظات",
    },
    {
      icon: HeadphonesIcon,
      title: "دعم متواصل",
      description: "فريق خدمة العملاء متاح للإجابة على استفساراتك",
    },
    {
      icon: Award,
      title: "أسعار منافسة",
      description: "نقدم أفضل الأسعار مع عروض وخصومات مستمرة",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ريمو ستور
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            وجهتك الأولى للتسوق الإلكتروني في مصر
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              قصتنا
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              بدأ ريمو ستور برؤية بسيطة: توفير تجربة تسوق إلكترونية استثنائية للعملاء في مصر. 
              نحن نؤمن بأن كل عميل يستحق الحصول على منتجات عالية الجودة بأسعار مناسبة 
              مع خدمة توصيل سريعة وموثوقة.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              اليوم، نفخر بخدمة آلاف العملاء السعداء ونستمر في توسيع تشكيلتنا 
              لتشمل أفضل المنتجات من أفضل الموردين.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            لماذا تختار ريمو ستور؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-teal-400 mb-2">+1000</p>
              <p className="text-gray-400">عميل سعيد</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">+500</p>
              <p className="text-gray-400">منتج متنوع</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">27</p>
              <p className="text-gray-400">محافظة</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">24/7</p>
              <p className="text-gray-400">دعم العملاء</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            ابدأ التسوق الآن
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            اكتشف تشكيلتنا المميزة واستمتع بتجربة تسوق لا مثيل لها
          </p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
          >
            تصفح المنتجات
          </Link>
        </div>
      </section>
    </div>
  );
}
