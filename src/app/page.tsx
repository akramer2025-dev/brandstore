import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardPro } from '@/components/ProductCardPro';
import { ProductsSlider } from '@/components/ProductsSlider';
import { HeroSlider } from '@/components/HeroSlider';
import { CategoriesSection } from '@/components/CategoriesSection';
import { LogoBanner } from '@/components/LogoBanner';
import { BestSellersSection } from '@/components/BestSellersSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import ChatButton from '@/components/ChatButton';
import FlashDeals from '@/components/FlashDeals';
import SplashScreen from '@/components/SplashScreen';
import NewsTicker from '@/components/NewsTicker';
import SpinWheel from '@/components/SpinWheel';
import PendingPrizeHandler from '@/components/PendingPrizeHandler';
import Link from 'next/link';
import { Sparkles, ShoppingBag, TrendingUp, Award, Shield, Truck, Star } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ريمو ستور - تسوق أونلاين | أفضل الأسعار والعروض',
  description: 'تسوق أحدث المنتجات بأفضل الأسعار في ريمو ستور. شحن سريع لجميع المحافظات، دفع آمن، ضمان جودة 100%. منتجات أصلية وعروض حصرية يومية.',
  keywords: 'تسوق أونلاين، ريمو ستور، متجر إلكتروني، شراء أونلاين مصر، أفضل الأسعار، شحن سريع، منتجات أصلية، عروض وخصومات',
  openGraph: {
    title: 'ريمو ستور - تسوق أونلاين | أفضل الأسعار والعروض',
    description: 'تسوق أحدث المنتجات بأفضل الأسعار. شحن سريع، دفع آمن، ضمان جودة.',
    type: 'website',
    locale: 'ar_EG',
  },
};

async function getProducts() {
  try {
    return await prisma.product.findMany({
      take: 12,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    // جلب الفئات مع عدد المنتجات وترتيبها حسب الأكثر منتجات
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    // ترتيب حسب عدد المنتجات (الأكثر أولاً)
    return categories
      .sort((a, b) => b._count.products - a._count.products)
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getBestSellingProducts() {
  try {
    // جلب المنتجات الأكثر مبيعاً من OrderItem
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    });

    // جلب تفاصيل المنتجات
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        reviews: { select: { rating: true } },
      },
    });

    // إضافة عدد المبيعات لكل منتج
    const productsWithSales = products.map(product => {
      const sales = topProducts.find(item => item.productId === product.id);
      return {
        ...product,
        soldCount: sales?._sum.quantity || 0,
      };
    });

    // ترتيب حسب المبيعات
    return productsWithSales.sort((a, b) => b.soldCount - a.soldCount);
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
}

async function getTopReviews() {
  try {
    // جلب أفضل التقييمات (5 نجوم فقط)
    return await prisma.review.findMany({
      where: {
        rating: { gte: 4 },
        isApproved: true,
      },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { nameAr: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}


export default async function HomePage() {
  // السماح لجميع المستخدمين برؤية الصفحة الرئيسية
  // لن يتم redirect تلقائي لأي مستخدم
  
  try {
    const [products, categories, bestSellers, topReviews] = await Promise.all([
      getProducts(),
      getCategories(),
      getBestSellingProducts(),
      getTopReviews(),
    ]);

    return (
      <>
        {/* <SplashScreen /> */}
        
        {/* Pending Prize Handler - معالجة الجائزة المعلقة */}
        <PendingPrizeHandler />
        
        {/* Spin Wheel - عجلة الحظ للزوار الجدد */}
        <SpinWheel />
        
        {/* News Ticker - شريط الأخبار المتحرك */}
        <NewsTicker />
        
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '1s' }}>

      {/* Hero Slider with Integrated Logo - Full Width */}
      <HeroSlider />

      {/* Categories Section - تسوق حسب الفئة (أفقي مثل نون وشي إن) */}
      {categories.length > 0 && (
        <CategoriesSection categories={categories} />
      )}

      {/* Products Section - أحدث المنتجات أولاً */}
      <section className="py-4 md:py-6 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900/50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 gap-4">
            <div className="text-center md:text-right">
              {/* تم حذف الخط الملون أعلى العنوان */}
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
                أحدث المنتجات
              </h2>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              {/* Grid View - Pro Style */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-6 md:mb-8">
                {products.slice(0, 8).map((product, index) => (
                  <ProductCardPro key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Interactive Slider */}
              <div className="mb-4 md:mb-6">
                <div className="text-center mb-4 md:mb-6">
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

          <div className="text-center mt-6 md:mt-8">
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


      {/* Flash Deals Section */}
      <FlashDeals />

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <BestSellersSection products={bestSellers} />
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      {topReviews.length > 0 && (
        <TestimonialsSection reviews={topReviews.map(review => ({
          ...review,
          comment: review.comment || 'تجربة رائعة!',
          createdAt: review.createdAt.toISOString(),
          user: {
            name: review.user.name || 'عميل',
            image: review.user.image || null
          },
          product: { nameAr: review.product.nameAr || review.product.name }
        }))} />
      )}

      {/* Trust Badges */}
      {categories.length > 0 && (
        <>
          {/* Trust Badges تحت الفئات */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 my-8 py-4 px-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
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
        </>
      )}

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
  } catch (error) {
    console.error('Error rendering home page:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 rounded-lg backdrop-blur-sm max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">⚠️ حدث خطأ</h1>
          <p className="text-gray-300 mb-6">
            عذراً، حدث خطأ أثناء تحميل الصفحة. نحن نعمل على حل المشكلة.
          </p>
          <a 
            href="/api/health" 
            target="_blank"
            className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition mb-3"
          >
            🔍 فحص حالة الخادم
          </a>
          <p className="text-xs text-gray-400">
            إذا استمرت المشكلة، يرجى مراجعة سجلات Vercel
          </p>
        </div>
      </div>
    );
  }
}
