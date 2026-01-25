import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductsSlider } from '@/components/ProductsSlider';
import { HeroSlider } from '@/components/HeroSlider';
import { CategoriesSection } from '@/components/CategoriesSection';
import ChatButton from '@/components/ChatButton';
import FlashDeals from '@/components/FlashDeals';
import SplashScreen from '@/components/SplashScreen';
import Link from 'next/link';
import { Sparkles, ShoppingBag, TrendingUp } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
  // التحقق من المستخدم وتحويله للصفحة المناسبة
  const session = await auth();
  
  if (session?.user) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    } else if (session.user.role === 'VENDOR') {
      redirect('/vendor');
    } else if (session.user.role === 'DELIVERY_STAFF') {
      redirect('/delivery-dashboard');
    } else if (session.user.role === 'CUSTOMER') {
      redirect('/customer');
    }
  }

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <SplashScreen />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '1s' }}>
      {/* Hero Slider - Full Width */}
      <HeroSlider />

      {/* Flash Deals Section */}
      <FlashDeals />

      {/* Products Section */}
      <section className="py-8 md:py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-1 md:mb-2">
                أحدث المنتجات
              </h2>
              <p className="text-sm md:text-base text-gray-300">
                اكتشف تشكيلتنا المميزة من الأزياء والملابس
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-full animate-bounce-scale">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
              <span className="font-semibold">عروض حصرية</span>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              {/* Grid View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {products.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Interactive Slider */}
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-4 md:mb-6 text-center">
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              <h3 className="text-xl md:text-2xl font-bold">براند ستور</h3>
            </div>
            <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
              وجهتك الأولى للتسوق الإلكتروني
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center text-xs md:text-sm text-gray-400">
              <Link href="/products" className="hover:text-white transition">
                المنتجات
              </Link>
              <Link href="/cart" className="hover:text-white transition">
                السلة
              </Link>
              <Link href="/profile" className="hover:text-white transition">
                حسابي
              </Link>
              <Link href="/admin" className="hover:text-white transition">
                لوحة التحكم
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-500 mb-2">
                © 2024 براند ستور. جميع الحقوق محفوظة.
              </p>
              <p className="text-xs text-gray-600">
                Developed by <span className="text-cyan-400 font-semibold">Eng/ Akram Elmasry</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Button - Floating */}
      <ChatButton />
    </div>
    </>
  );
}
