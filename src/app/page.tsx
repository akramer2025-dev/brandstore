import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardPro } from '@/components/ProductCardPro';
import { ProductsSlider } from '@/components/ProductsSlider';
import { HeroSlider } from '@/components/HeroSlider';
import { CategoriesSection } from '@/components/CategoriesSection';
import { LogoBanner } from '@/components/LogoBanner';
import ChatButton from '@/components/ChatButton';
import FlashDeals from '@/components/FlashDeals';
import SplashScreen from '@/components/SplashScreen';
import Link from 'next/link';
import { Sparkles, ShoppingBag, TrendingUp, Award, Shield, Truck, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts() {
  return await prisma.product.findMany({
    take: 12,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getCategories() {
  return await prisma.category.findMany({
    take: 8,
    orderBy: {
      nameAr: 'asc',
    },
  });
}


export default async function HomePage() {
  // السماح لجميع المستخدمين برؤية الصفحة الرئيسية
  // لن يتم redirect تلقائي لأي مستخدم
  
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* <SplashScreen /> */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '1s' }}>
      
      {/* Hero Slider with Integrated Logo - Full Width */}
      <HeroSlider />

      {/* Flash Deals Section */}
      <FlashDeals />

      {/* Categories Section */}
      {categories.length > 0 && (
        <CategoriesSection categories={categories} />
      )}

      {/* Products Section */}
      <section className="py-10 md:py-16 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900/50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
                <span className="text-teal-400 font-medium text-sm">تشكيلة مميزة</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
                أحدث المنتجات
              </h2>
              <p className="text-sm md:text-base text-gray-400">
                اكتشف تشكيلتنا الحصرية من أجود الأزياء والملابس
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-teal-500/30">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">عروض حصرية</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-gray-800/80 text-gray-300 px-4 py-2 rounded-full border border-gray-700">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">تقييمات عالية</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 md:mb-12 py-4 px-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-300">
              <Shield className="w-5 h-5 text-teal-400" />
              <span className="text-xs md:text-sm font-medium">ضمان جودة 100%</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Truck className="w-5 h-5 text-teal-400" />
              <span className="text-xs md:text-sm font-medium">شحن سريع لجميع المحافظات</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Award className="w-5 h-5 text-teal-400" />
              <span className="text-xs md:text-sm font-medium">منتجات أصلية</span>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              {/* Grid View - Pro Style */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-10 md:mb-16">
                {products.slice(0, 8).map((product, index) => (
                  <ProductCardPro key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Interactive Slider */}
              <div className="mb-8 md:mb-12">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                    تصفح المزيد من المنتجات
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base">اسحب لاستكشاف المزيد من العروض</p>
                </div>
                <ProductsSlider products={products} direction="rtl" />
              </div>
            </>
          ) : (
            <div className="text-center py-16 md:py-24">
              <div className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 md:w-14 md:h-14 text-gray-500" />
              </div>
              <p className="text-gray-300 text-lg md:text-xl mb-2">لا توجد منتجات متاحة حالياً</p>
              <p className="text-gray-500 text-sm">سيتم إضافة منتجات جديدة قريباً</p>
            </div>
          )}

          <div className="text-center mt-10 md:mt-14">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 text-white px-8 py-4 md:px-12 md:py-5 rounded-full font-bold hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 text-base md:text-lg group"
            >
              <span>عرض جميع المنتجات</span>
              <TrendingUp className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 mt-8 md:mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* About Store */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-teal-400" />
                <h3 className="text-lg md:text-xl font-bold">ريمو ستور</h3>
              </div>
              <p className="text-gray-400 text-sm">
                وجهتك الأولى للتسوق الإلكتروني - نوفر لك أفضل المنتجات بأفضل الأسعار مع خدمة توصيل سريعة.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3 text-teal-400">روابط سريعة</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/products" className="hover:text-white transition">
                  جميع المنتجات
                </Link>
                <Link href="/cart" className="hover:text-white transition">
                  سلة التسوق
                </Link>
                <Link href="/wishlist" className="hover:text-white transition">
                  المفضلة
                </Link>
                <Link href="/profile" className="hover:text-white transition">
                  حسابي
                </Link>
              </div>
            </div>
            
            {/* Customer Service */}
            <div>
              <h4 className="font-semibold mb-3 text-teal-400">خدمة العملاء</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/about" className="hover:text-white transition">
                  من نحن
                </Link>
                <Link href="/contact" className="hover:text-white transition">
                  اتصل بنا
                </Link>
                <Link href="/faq" className="hover:text-white transition">
                  الأسئلة الشائعة
                </Link>
                <Link href="/privacy" className="hover:text-white transition">
                  سياسة الخصوصية
                </Link>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-3 text-teal-400">تواصل معنا</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <p>📱 01555512778</p>
                <p>📧 akram.er2025@gmail.com</p>
                <p>📍 مصر - القاهرة</p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500 mb-2">
              © 2026 ريمو ستور. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-gray-600">
              Developed by <span className="text-cyan-400 font-semibold">Eng/ Akram Elmasry</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Button - Floating */}
      <ChatButton />
    </div>
    </>
  );
}
