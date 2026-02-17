import dynamicImport from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import { ProductCardPro } from '@/components/ProductCardPro';
import { HeroSlider } from '@/components/HeroSlider';
import { AnimatedSection } from '@/components/AnimatedSection';
import { CategoryProductsCarousel } from '@/components/CategoryProductsCarousel';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, ShoppingBag, Sparkles, Shield, CheckCircle, Phone, Mail, MapPin, Facebook, Instagram, CreditCard } from 'lucide-react';
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
import { TrustBadgesCompact } from '@/components/TrustBadges';

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

  // خريطة الصور الافتراضية حسب اسم الفئة - صور محسّنة وأكثر وضوحاً
  const name = categoryName.toLowerCase().trim();
  
  // 📱 موبايلات وهواتف
  if (name.includes('موبايل') || name.includes('هاتف') || name.includes('phone') || name.includes('mobile')) 
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&q=90';
  
  // 💻 لاب توب وكمبيوتر
  if (name.includes('لاب') || name.includes('كمبيوتر') || name.includes('laptop') || name.includes('computer')) 
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&q=90';
  
  // 👕 تيشيرتات
  if (name.includes('تيشيرت') || name.includes('tshirt') || name.includes('t-shirt')) 
    return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&q=90';
  
  // 👟 أحذية
  if (name.includes('أحذية') || name.includes('shoes') || name.includes('حذاء') || name.includes('جزمة')) 
    return 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&h=200&fit=crop&q=90';
  
  // 👖 بناطيل
  if (name.includes('بناطيل') || name.includes('pants') || name.includes('بنطلون') || name.includes('جينز')) 
    return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop&q=90';
  
  // 🧥 جواكت
  if (name.includes('جواك') || name.includes('jackets') || name.includes('جاكت') || name.includes('معطف')) 
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop&q=90';
  
  // 👗 ملابس عامة
  if (name.includes('ملابس') || name.includes('clothes') || name.includes('fashion') || name.includes('أزياء')) 
    return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop&q=90';
  
  // 🛍️ شي إن SHEIN
  if (name.includes('شي إن') || name.includes('shein')) 
    return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop&q=90';
  
  // 🛍️ ترينديول Trendyol
  if (name.includes('ترينديول') || name.includes('trendyol')) 
    return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop&q=90';
  
  // 💄 تجميل ومكياج
  if (name.includes('تجميل') || name.includes('cosmetics') || name.includes('مكياج') || name.includes('makeup')) 
    return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop&q=90';
  
  // 💍 ذهب وفضة ومجوهرات
  if (name.includes('ذهب') || name.includes('فضه') || name.includes('gold') || name.includes('مجوهرات') || name.includes('jewelry')) 
    return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop&q=90';
  
  // 👜 اكسسوارات
  if (name.includes('اكسسوار') || name.includes('accessories') || name.includes('حقائب')) 
    return 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=200&h=200&fit=crop&q=90';
  
  // 🚗 سيارات
  if (name.includes('سيارة') || name.includes('سيارات') || name.includes('car')) 
    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop&q=90';
  
  // 🏍️ موتوسيكلات
  if (name.includes('موتوسيكل') || name.includes('دراجة') || name.includes('motorcycle')) 
    return 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200&h=200&fit=crop&q=90';
  
  // ⚡ إلكترونيات
  if (name.includes('إلكترون') || name.includes('electronic') || name.includes('كهرب')) 
    return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=200&fit=crop&q=90';
  
  // 🎮 ألعاب
  if (name.includes('ألعاب') || name.includes('toys') || name.includes('لعب')) 
    return 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop&q=90';
  
  // 🏃 رياضة
  if (name.includes('رياضة') || name.includes('sport') || name.includes('رياضي')) 
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop&q=90';
  
  // 📚 كتب
  if (name.includes('كتب') || name.includes('book') || name.includes('قراءة')) 
    return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=200&fit=crop&q=90';
  
  // 🛋️ أثاث
  if (name.includes('أثاث') || name.includes('furniture') || name.includes('ديكور')) 
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop&q=90';
  
  // 🍳 مطبخ
  if (name.includes('مطبخ') || name.includes('kitchen') || name.includes('طبخ')) 
    return 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop&q=90';
  
  // 🌙 رمضان
  if (name.includes('رمضان') || name.includes('ramadan') || name.includes('فانوس')) 
    return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=200&h=200&fit=crop&q=90';
  
  // 🎧 سماعات
  if (name.includes('سماعات') || name.includes('headphone') || name.includes('audio')) 
    return 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&h=200&fit=crop&q=90';
  
  // 📺 شاشات وتلفزيون
  if (name.includes('شاشة') || name.includes('تلفزيون') || name.includes('tv') || name.includes('screen')) 
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop&q=90';
  
  // ⌚ ساعات
  if (name.includes('ساعة') || name.includes('ساعات') || name.includes('watch')) 
    return 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&h=200&fit=crop&q=90';
  
  // 🎒 حقائب مدرسية
  if (name.includes('شنطة') || name.includes('حقيبة') || name.includes('bag') || name.includes('backpack')) 
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&q=90';
  
  // صورة افتراضية عامة
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop&q=90';
}

// Helper function to safely get first product image
function getFirstImage(images: any): string | null {
  if (!images) return null;
  
  try {
    // If it's already an array
    if (Array.isArray(images)) {
      return images[0] || null;
    }
    
    // If it's a string
    if (typeof images === 'string') {
      // Check if it's a comma-separated list of URLs
      if (images.includes(',') && images.includes('http')) {
        const urls = images.split(',').map(url => url.trim());
        return urls[0] || null;
      }
      
      // Check if it's a single URL
      if (images.startsWith('http')) {
        return images;
      }
      
      // Try to parse as JSON
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : null;
    }
    
    return null;
  } catch (error) {
    // If parsing fails, return the string if it looks like a URL
    if (typeof images === 'string' && images.startsWith('http')) {
      return images;
    }
    return null;
  }
}

async function getActiveAuctions() {
  try {
    const now = new Date();
    
    // @ts-ignore - Temporarily ignore until migration applied
    return await prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gt: now // فقط المزادات التي لم تنتهي بعد
        }
      },
      take: 6,
      orderBy: [
        { featured: 'desc' },
        { endDate: 'asc' }
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            images: true,
          }
        },
        _count: {
          select: {
            bids: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }
}

async function getProducts() {
  try {
    return await prisma.product.findMany({
      take: 20, // تقليل العدد لتحسين الأداء
      include: {
        category: {
          select: {
            id: true,
            nameAr: true,
          }
        },
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
      select: {
        id: true,
        nameAr: true,
        image: true,
        _count: {
          select: { products: true }
        }
      },
      where: {
        products: {
          some: {} // فقط الفئات التي تحتوي على منتجات
        }
      }
    });
    
    // ترتيب حسب عدد المنتجات (الأكثر منتجات أولاً)
    return categories.sort((a, b) => b._count.products - a._count.products);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getProductsByCategory(categoryId: string, limit = 12) {
  try {
    return await prisma.product.findMany({
      where: { 
        categoryId,
        isActive: true,
        isVisible: true,
      },
      take: limit,
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        originalPrice: true,
        images: true, // ✅ نتأكد من جلب الصور
        stock: true,
        soldCount: true,
        badge: true,
        isFlashDeal: true,
        flashDealEndsAt: true,
        category: {
          select: {
            id: true,
            nameAr: true,
          }
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
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
    const [products, categories, topReviews, auctions] = await Promise.all([
      getProducts(),
      getCategories(),
      getTopReviews(),
      getActiveAuctions(),
    ]);

    // جلب منتجات لأول 3 فئات (للأشرطة المتحركة)
    const topCategories = categories.slice(0, 3);
    const categoryProducts = await Promise.all(
      topCategories.map(cat => getProductsByCategory(cat.id, 12))
    );

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
              style={{ width: 'auto', height: 'auto', maxWidth: '60px', maxHeight: '60px' }}
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
              style={{ width: 'auto', height: 'auto', maxWidth: '50px', maxHeight: '50px' }}
              className="object-contain -rotate-12 filter opacity-20 hover:opacity-30 transition-opacity duration-700"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-scroll overflow-y-hidden py-2 scroll-smooth" style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#9333ea #f3e8ff'
            }}>
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

      {/* Auctions Section - المزادات النشطة */}
      {auctions.length > 0 && (
        <section className="py-4 sm:py-6">
          <div className="container mx-auto px-3 sm:px-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">المزادات النشطة</h2>
                  <p className="text-xs text-gray-500 hidden sm:block">شارك في المزايدة الآن</p>
                </div>
              </div>
              <Link 
                href="/auctions"
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
              >
                <span>عرض الكل</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>

            {/* Auctions Horizontal Scroll */}
            <div 
              className="flex gap-3 sm:gap-4 overflow-x-scroll pb-2 scroll-smooth"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#9333ea #f3f4f6'
              }}
            >
              {auctions.map((auction: any) => {
                const timeLeft = new Date(auction.endDate).getTime() - Date.now();
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const isEndingSoon = hours < 24;
                const auctionImage = getFirstImage(auction.product?.images);

                return (
                  <Link 
                    key={auction.id} 
                    href={`/auctions/${auction.id}`}
                    className="group flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-300"
                  >
                    <div className="flex gap-3 p-3">
                      {/* Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {auctionImage && (
                          <Image
                            src={auctionImage}
                            alt={auction.titleAr || auction.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="96px"
                          />
                        )}
                        {auction.featured && (
                          <div className="absolute top-1 right-1 bg-yellow-400 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                            ⭐
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {auction.titleAr || auction.title}
                        </h3>
                        
                        <div className="mb-2">
                          <p className="text-xs text-gray-500">السعر الحالي</p>
                          <p className="text-lg font-black text-purple-600">
                            {auction.currentPrice} ج.م
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className={`px-2 py-1 rounded-full font-medium ${
                            isEndingSoon 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            ⏱ {hours > 0 ? `${hours}س ${minutes}د` : `${minutes}د`}
                          </div>
                          <div className="text-gray-600">
                            {auction._count?.bids || 0} مزايدة
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
                {products.slice(0, 8).map((product, index) => (
                  <ProductCardPro key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Category Carousels - أشرطة متحركة للفئات */}
              {topCategories.map((category, idx) => {
                const catProducts = categoryProducts[idx];
                if (catProducts.length === 0) return null;
                
                return (
                  <div key={category.id} className="mb-8">
                    <CategoryProductsCarousel 
                      categoryId={category.id}
                      categoryName={category.nameAr}
                      initialProducts={catProducts as any}
                    />
                  </div>
                );
              })}

              {/* More Products */}
              {products.length > 8 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                  {products.slice(8, 16).map((product, index) => (
                    <ProductCardPro key={product.id} product={product} index={index + 8} />
                  ))}
                </div>
              )}

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
          {/* Trust Badges */}
          <div className="mb-8 pb-8 border-b border-gray-800">
            <TrustBadgesCompact />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* About Store */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Remo Store</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                وجهتك الأولى للتسوق الإلكتروني - نوفر لك أفضل المنتجات بأفضل الأسعار مع خدمة توصيل سريعة.
              </p>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Shield className="w-4 h-4" />
                <span>موقع آمن ومحمي 🔒</span>
              </div>
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
            
            {/* Policies & Support */}
            <div>
              <h4 className="font-semibold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">السياسات والدعم</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/about" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  من نحن
                </Link>
                <Link href="/contact" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  اتصل بنا
                </Link>
                <Link href="/privacy" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  سياسة الخصوصية
                </Link>
                <Link href="/terms" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  الشروط والأحكام
                </Link>
                <Link href="/refund-policy" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  سياسة الاسترجاع
                </Link>
                <Link href="/shipping-policy" className="hover:text-white hover:translate-x-[-2px] transition-all">
                  سياسة الشحن
                </Link>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">تواصل معنا</h4>
              <div className="flex flex-col gap-3 text-sm">
                <a 
                  href="tel:01555512778" 
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>01555512778</span>
                </a>
                <a 
                  href="https://wa.me/201555512778" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors group"
                >
                  <svg className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>واتساب: 01555512778</span>
                </a>
                <a 
                  href="mailto:info@remostore.net" 
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>info@remostore.net</span>
                </a>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>مصر - القاهرة</span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <h5 className="text-xs font-semibold text-gray-400 mb-3">تابعنا على</h5>
                <div className="flex items-center gap-3">
                  <a 
                    href="https://www.facebook.com/share/182kW5HPmz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://www.instagram.com/remostore.egy?utm_source=qr&igsh=MWZiZG0zYzhtOW1ieA%3D%3D" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://www.tiktok.com/@remo.store37?_r=1&_t=ZS-940eVJUQJgi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-black hover:bg-gray-900 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-8 pb-8 border-t border-b border-gray-800 pt-8">
            <h4 className="text-center font-semibold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">طرق الدفع المتاحة</h4>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {/* Cash on Delivery */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300 font-semibold">الدفع عند الاستلام</span>
                </div>
              </div>

              {/* Paymob */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-xs font-bold text-blue-600">Paymob</span>
                  </div>
                </div>
              </div>

              {/* Visa */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all">
                <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="white"/>
                  <path d="M20.176 23.238h-3.162l1.968-12.143h3.162l-1.968 12.143zm11.126-11.827c-.627-.243-1.605-.507-2.829-.507-3.117 0-5.311 1.623-5.328 3.949-.017 1.719 1.571 2.678 2.77 3.251 1.232.587 1.646 0.964 1.641 1.488-.006 0.803-0.985 1.17-1.895 1.17-1.266 0-1.938-0.181-2.975-0.628l-0.407-0.191-0.444 2.689c0.742 0.336 2.115 0.628 3.539 0.642 3.316 0 5.468-1.605 5.49-4.088 0.012-1.362-0.831-2.398-2.655-3.251-1.105-0.553-1.783-0.921-1.777-1.481 0-0.497 0.573-1.029 1.811-1.029 1.033-0.017 1.783 0.217 2.366 0.459l0.284 0.137 0.431-2.611zm7.477-0.316h-2.441c-0.757 0-1.322 0.214-1.654 0.995l-4.694 10.948h3.312l0.659-1.785h4.049l0.382 1.785h2.921l-2.534-12.143zm-3.911 7.857c0.026-0.068 1.264-3.357 1.264-3.357-0.017 0.029 0.260-0.697 0.420-1.149l0.214 1.032s0.606 2.858 0.733 3.474h-2.631zm-18.253-7.857l-3.091 8.278-0.331-1.643c-0.576-1.918-2.366-3.998-4.369-5.037l2.833 10.539h3.336l4.962-12.137h-3.340z" fill="#1434CB"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-all">
                <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="white"/>
                  <circle cx="18" cy="16" r="9" fill="#EB001B"/>
                  <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
                  <path d="M24 9.5c-1.657 1.449-2.7 3.576-2.7 5.985s1.043 4.536 2.7 5.985c1.657-1.449 2.7-3.576 2.7-5.985S25.657 10.949 24 9.5z" fill="#FF5F00"/>
                </svg>
              </div>

              {/* Fawry */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 hover:border-orange-500/50 transition-all">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-bold text-orange-600">Fawry</span>
                </div>
              </div>

              {/* Vodafone Cash */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-all">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-bold text-red-600">Vodafone Cash</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400 text-center md:text-right">
                © 2026 <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-semibold">Remo Store</span>. جميع الحقوق محفوظة.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span>SSL Certified</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-blue-400" />
                  <span>Verified Business</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Developed with ❤️ by <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-semibold">Eng/ Akram Elmasry</span>
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
