import dynamicImport from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import { ProductCardPro } from '@/components/ProductCardPro';
import { HeroSlider } from '@/components/HeroSlider';
import { AnimatedSection } from '@/components/AnimatedSection';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, ShoppingBag, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import { RamadanHomeDecorations } from '@/components/RamadanHomeDecorations';
import BrandBackgroundPattern from '@/components/BrandBackgroundPattern';
import FloatingBubbles from '@/components/FloatingBubbles';
import FireworksEffect from '@/components/FireworksEffect';
import RamadanBanner from '@/components/RamadanBanner';
import PendingPrizeHandler from '@/components/PendingPrizeHandler';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { InfiniteProductCarousel } from '@/components/InfiniteProductCarousel';
import { ProductsSlider } from '@/components/ProductsSlider';
import FlashDeals from '@/components/FlashDeals';
import { LogoBanner } from '@/components/LogoBanner';
import ChatButton from '@/components/ChatButton';
import CustomerAssistant from '@/components/customer-assistant';

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

// 🎨 Helper function لاختيار الصورة المناسبة للفئة
function getCategoryImage(categoryName: string, categoryImage?: string | null): string {
  // ✅ أولاً: إذا كان في صورة محفوظة من لوحة الإدارة، استخدمها
  if (categoryImage && categoryImage.trim() !== '') {
    return categoryImage;
  }

  // خريطة الصور الافتراضية حسب اسم الفئة
  const name = categoryName.toLowerCase().trim();
  
  // فئات محددة
  if (name.includes('تيشيرت') || name.includes('tshirt')) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop&q=80';
  if (name.includes('أحذية') || name.includes('shoes') || name.includes('حذاء')) return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&q=80';
  if (name.includes('بناطيل') || name.includes('pants') || name.includes('بنطلون')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop&q=80';
  if (name.includes('جواك') || name.includes('jackets') || name.includes('جاكت')) return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop&q=80';
  if (name.includes('شي إن') || name.includes('shein')) return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=100&fit=crop&q=80';
  if (name.includes('ترينديول') || name.includes('trendyol')) return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&q=80';
  if (name.includes('تجميل') || name.includes('cosmetics') || name.includes('مكياج')) return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&q=80';
  if (name.includes('ذهب') || name.includes('فضه') || name.includes('gold') || name.includes('مجوهرات')) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&q=80';
  if (name.includes('اكسسوار') || name.includes('accessories')) return 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=100&h=100&fit=crop&q=80';
  
  // فئات جديدة
  if (name.includes('سيارة') || name.includes('سيارات') || name.includes('car')) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&h=100&fit=crop&q=80';
  if (name.includes('إلكترون') || name.includes('electronic') || name.includes('موبايل')) return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&q=80';
  if (name.includes('ملابس') || name.includes('clothes')) return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&h=100&fit=crop&q=80';
  if (name.includes('رياضة') || name.includes('sport') || name.includes('رياضي')) return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=100&h=100&fit=crop&q=80';
  if (name.includes('كتب') || name.includes('book') || name.includes('قراءة')) return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=100&h=100&fit=crop&q=80';
  if (name.includes('أثاث') || name.includes('furniture') || name.includes('ديكور')) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop&q=80';
  
  // صورة افتراضية للفئات العامة أو غير المعروفة
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&q=80';
}

async function getProducts() {
  try {
    return await prisma.product.findMany({
      take: 30, // زيادة العدد لعرض المزيد من المنتجات
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
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    // ترتيب حسب عدد المنتجات (الأكثر منتجات أولاً) ثم عرض جميع الفئات
    return categories
      .sort((a, b) => b._count.products - a._count.products);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}


async function getTopReviews() {
  try {
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
  try {
    const [products, categories, topReviews] = await Promise.all([
      getProducts(),
      getCategories(),
      getTopReviews(),
    ]);

    return (
      <>
        {/* ديكورات رمضانية في خلفية الصفحة */}
        <RamadanHomeDecorations />

        {/* Brand Background Pattern */}
        <BrandBackgroundPattern />

        {/* Floating Bubbles */}
        <FloatingBubbles />

        {/* تأثير الصواريخ بعد الـ Splash */}
        <FireworksEffect />

        {/* Main Content */}
        <div>

        {/* 🌙 بانر رمضان كريم */}
        <RamadanBanner />
        
        {/* Pending Prize Handler */}
        <PendingPrizeHandler />
        
        {/*  MAIN CONTENT - خلفية موف فاتحة */}
        <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">

      {/* Hero Slider */}
      <HeroSlider />
      
      {/* 🎯 CATEGORIES BAR - منفصلة */}
      {categories.length > 0 && (
        <section className="py-3 sm:py-4 bg-white relative overflow-hidden">
          {/* Background Image - تتداخل مع الفئات - مخفي على الموبايل */}
          <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 opacity-8 z-0">
            <Image
              src="/background.png"
              alt=""
              width={60}
              height={60}
              className="object-contain rotate-12 filter opacity-25 hover:opacity-35 transition-opacity duration-500"
              loading="lazy"
              unoptimized
            />
          </div>
          {/* صورة إضافية في الجانب الآخر للتوازن - مخفي على الموبايل */}
          <div className="hidden sm:block absolute left-8 top-1/2 -translate-y-1/2 opacity-8 z-0">
            <Image
              src="/background.png"
              alt=""
              width={50}
              height={50}
              className="object-contain -rotate-12 filter opacity-20 hover:opacity-30 transition-opacity duration-700"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-hide py-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className={`relative flex items-center gap-1.5 sm:gap-3 md:gap-2 px-2 sm:px-6 md:px-5 py-2 sm:py-4 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap group hover:shadow-md hover:scale-105 hover:-translate-y-1 ${
                    category.nameAr.includes('جواك') || category.nameAr.includes('ملابس')
                      ? 'bg-gradient-to-r from-purple-50/80 to-pink-50/80 hover:from-purple-100/80 hover:to-pink-100/80'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  style={{
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderImage: 'linear-gradient(135deg, rgb(147 51 234) 0%, rgb(236 72 153) 50%, rgb(249 115 22) 100%) 1'
                  }}
                >
                  <div className="relative w-8 h-8 sm:w-14 sm:h-14 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 sm:ring-2 ring-purple-200">
                    <Image
                        src={getCategoryImage(category.nameAr, category.image)}
                        alt={category.nameAr}
                        width={32}
                        height={32}
                        sizes="(max-width: 640px) 32px, 56px"
                        className="object-cover w-full h-full"
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs sm:text-base md:text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-orange-600 transition-all">
                      {category.nameAr}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section - أحدث المنتجات */}
      <section className="py-4 sm:py-6 bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Section Header */}
          <AnimatedSection animation="fadeInDown" delay={0}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  أحدث المنتجات
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">اكتشف أحدث الإضافات لمتجرنا</p>
              </div>
              <Link 
                href="/products"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 font-semibold text-sm transition-all"
              >
                عرض الكل
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </Link>
            </div>
          </AnimatedSection>

          {products.length > 0 ? (
            <>
              {/* Grid View - احترافي نظيف مع عرض المزيد من المنتجات */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                {products.slice(0, 20).map((product, index) => (
                  <ProductCardPro key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* View All Button */}
              <AnimatedSection animation="scaleIn" delay={200}>
                <div className="text-center">
                  <Link 
                    href="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    <span>عرض جميع المنتجات</span>
                    <TrendingUp className="w-5 h-5" />
                  </Link>
                </div>
              </AnimatedSection>
            </>
          ) : (
            <div className="text-center py-12 sm:py-16 md:py-24">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent" style={{WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text'}} />
              </div>
              <p className="text-base sm:text-lg md:text-xl mb-2 font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">لا توجد منتجات متاحة حالياً</p>
              <p className="text-gray-500 text-xs sm:text-sm">سيتم إضافة منتجات جديدة قريباً</p>
            </div>
          )}
        </div>
      </section>



      {/* 🔥 بانر عروض خاصة */}
      <section className="py-6 sm:py-8 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 relative overflow-hidden">
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                <span className="text-white text-xs font-bold">🔥 عروض محدودة</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 drop-shadow-lg">
                خصومات تصل لـ 50% 🎉
              </h3>
              <p className="text-white/85 text-sm sm:text-base">
                استغل الفرصة قبل ما العرض ينتهي!
              </p>
            </div>
            <Link
              href="/products"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-purple-700 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              تسوق الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Infinite Product Carousel - الصف الـ11 */}
      {/* Temporarily disabled due to type error */}
      {/* {products.length > 10 && (
        <InfiniteProductCarousel products={products.slice(10)} speed={80} />
      )} */}



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


      {/* Footer */}
      <footer className="bg-gradient-to-b from-purple-950 to-gray-950 text-white py-8 md:py-12 mt-8 md:mt-16 border-t-4 border-purple-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* About Store */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Remo Store</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                وجهتك الأولى للتسوق الإلكتروني - نوفر لك أفضل المنتجات بأفضل الأسعار مع خدمة توصيل سريعة.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">روابط سريعة</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/products" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  جميع المنتجات
                </Link>
                <Link href="/cart" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  سلة التسوق
                </Link>
                <Link href="/wishlist" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  المفضلة
                </Link>
                <Link href="/profile" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  حسابي
                </Link>
              </div>
            </div>
            
            {/* Customer Service */}
            <div>
              <h4 className="font-semibold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">خدمة العملاء</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/about" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  من نحن
                </Link>
                <Link href="/contact" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  اتصل بنا
                </Link>
                <Link href="/faq" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  الأسئلة الشائعة
                </Link>
                <Link href="/privacy" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  سياسة الخصوصية
                </Link>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">تواصل معنا</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <p className="flex items-center gap-2">📱 01555512778</p>
                <p className="flex items-center gap-2">📧 remostore.egy@gmail.com</p>
                <p className="flex items-center gap-2">📍 مصر - القاهرة</p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400 mb-2">
              © 2026 <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-semibold">Remo Store</span>. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-gray-500">
              Developed by <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-semibold">Eng/ Akram Elmasry</span>
            </p>
          </div>
        </div>
      </footer>

      {/* زر الدردشة مع الدعم - مخفي حالياً */}
      {/* <ChatButton /> */}
      
      {/* مساعد ريمو الذكي */}
      <CustomerAssistant />
      </div>
    </div>
      </>
    );
  } catch (error) {
    console.error('Error rendering home page:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">⚠️ حدث خطأ</h1>
          <p className="text-gray-600 mb-6">
            عذراً، حدث خطأ أثناء تحميل الصفحة الرئيسية.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white rounded-lg transition shadow-lg"
          >
            إعادة تحميل الصفحة
          </Link>
        </div>
      </div>
    );
  }
}
