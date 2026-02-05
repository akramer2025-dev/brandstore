import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardFlashStyle } from '@/components/ProductCardFlashStyle';
import { ProductsSlider } from '@/components/ProductsSlider';
import { HeroSlider } from '@/components/HeroSlider';
import { CategoriesSection } from '@/components/CategoriesSection';
import { LogoBanner } from '@/components/LogoBanner';
import ChatButton from '@/components/ChatButton';
import FlashDeals from '@/components/FlashDeals';
import SplashScreen from '@/components/SplashScreen';
import Link from 'next/link';
import { Sparkles, ShoppingBag, TrendingUp } from 'lucide-react';

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
      <section className="py-8 md:py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                أحدث المنتجات
              </h2>
              <p className="text-sm md:text-base text-gray-300">
                اكتشف تشكيلتنا المميزة من الأزياء والملابس
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">عروض حصرية</span>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              {/* Grid View - Flash Deal Style */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-8 md:mb-12">
                {products.slice(0, 8).map((product) => (
                  <ProductCardFlashStyle key={product.id} product={product} />
                ))}
              </div>

              {/* Interactive Slider */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-100 mb-3 sm:mb-4 md:mb-6 text-center">
                  تصفح المزيد من المنتجات
                </h3>
                <ProductsSlider products={products} direction="rtl" />
              </div>
            </>
          ) : (
            <div className="text-center py-12 md:py-16">
              <ShoppingBag className="w-16 h-16 md:w-24 md:h-24 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-300 text-lg md:text-xl">لا توجد منتجات متاحة حالياً</p>
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link 
              href="/products" 
              className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 md:px-10 md:py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 text-base md:text-lg"
            >
              عرض جميع المنتجات
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
