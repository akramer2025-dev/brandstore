import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardPro } from '@/components/ProductCardPro';
import { ProductsSlider } from '@/components/ProductsSlider';
import { HeroSlider } from '@/components/HeroSlider';
import { CategoriesSection } from '@/components/CategoriesSection';
import ChatButton from '@/components/ChatButton';
import FlashDeals from '@/components/FlashDeals';
import Link from 'next/link';
import { Sparkles, ShoppingBag, TrendingUp, Award, Shield, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    return categories
      .sort((a, b) => b._count.products - a._count.products)
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function TestDesignPage() {
  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Sky Background with Clouds */}
        <div className="fixed inset-0 bg-gradient-to-b from-blue-400 via-blue-300 to-pink-200 z-0">
          {/* Animated Clouds */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Cloud 1 - Large */}
            <div className="absolute top-20 left-[-10%] animate-float-slow opacity-90">
              <svg width="300" height="120" viewBox="0 0 300 120">
                <ellipse cx="80" cy="80" rx="80" ry="50" fill="white" opacity="0.9"/>
                <ellipse cx="130" cy="70" rx="90" ry="55" fill="white" opacity="0.95"/>
                <ellipse cx="180" cy="75" rx="75" ry="45" fill="white" opacity="0.9"/>
                <ellipse cx="230" cy="85" rx="70" ry="40" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Cloud 2 - Medium */}
            <div className="absolute top-32 right-[10%] animate-float opacity-80">
              <svg width="250" height="100" viewBox="0 0 250 100">
                <ellipse cx="60" cy="60" rx="60" ry="40" fill="white" opacity="0.9"/>
                <ellipse cx="110" cy="55" rx="70" ry="45" fill="white" opacity="0.95"/>
                <ellipse cx="160" cy="60" rx="65" ry="40" fill="white" opacity="0.9"/>
                <ellipse cx="200" cy="65" rx="50" ry="35" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Cloud 3 - Small */}
            <div className="absolute top-48 left-[30%] animate-float-delayed opacity-75">
              <svg width="200" height="80" viewBox="0 0 200 80">
                <ellipse cx="50" cy="50" rx="50" ry="35" fill="white" opacity="0.9"/>
                <ellipse cx="90" cy="45" rx="55" ry="38" fill="white" opacity="0.95"/>
                <ellipse cx="130" cy="48" rx="50" ry="32" fill="white" opacity="0.9"/>
                <ellipse cx="165" cy="52" rx="40" ry="28" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Cloud 4 - Large Right */}
            <div className="absolute top-[60%] right-[-5%] animate-float-slow opacity-85">
              <svg width="320" height="130" viewBox="0 0 320 130">
                <ellipse cx="90" cy="85" rx="90" ry="55" fill="white" opacity="0.9"/>
                <ellipse cx="145" cy="75" rx="95" ry="58" fill="white" opacity="0.95"/>
                <ellipse cx="200" cy="80" rx="85" ry="50" fill="white" opacity="0.9"/>
                <ellipse cx="250" cy="88" rx="70" ry="42" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Cloud 5 - Medium Left */}
            <div className="absolute top-[50%] left-[5%] animate-float opacity-80">
              <svg width="260" height="105" viewBox="0 0 260 105">
                <ellipse cx="65" cy="65" rx="65" ry="42" fill="white" opacity="0.9"/>
                <ellipse cx="115" cy="58" rx="75" ry="47" fill="white" opacity="0.95"/>
                <ellipse cx="170" cy="63" rx="68" ry="42" fill="white" opacity="0.9"/>
                <ellipse cx="215" cy="68" rx="55" ry="37" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Cloud 6 - Small Top Right */}
            <div className="absolute top-16 right-[25%] animate-float-delayed opacity-70">
              <svg width="180" height="75" viewBox="0 0 180 75">
                <ellipse cx="45" cy="48" rx="45" ry="32" fill="white" opacity="0.9"/>
                <ellipse cx="80" cy="43" rx="50" ry="35" fill="white" opacity="0.95"/>
                <ellipse cx="115" cy="46" rx="45" ry="30" fill="white" opacity="0.9"/>
                <ellipse cx="145" cy="50" rx="35" ry="25" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Cloud 7 - Bottom Center */}
            <div className="absolute top-[70%] left-[40%] animate-float-slow opacity-75">
              <svg width="240" height="95" viewBox="0 0 240 95">
                <ellipse cx="55" cy="58" rx="55" ry="38" fill="white" opacity="0.9"/>
                <ellipse cx="100" cy="52" rx="65" ry="42" fill="white" opacity="0.95"/>
                <ellipse cx="150" cy="56" rx="60" ry="38" fill="white" opacity="0.9"/>
                <ellipse cx="190" cy="62" rx="50" ry="33" fill="white" opacity="0.85"/>
              </svg>
            </div>

            {/* Small fluffy clouds */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={`small-cloud-${i}`}
                className="absolute animate-float-slow opacity-60"
                style={{
                  top: `${15 + (i * 8)}%`,
                  left: `${10 + (i * 10)}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${20 + i * 3}s`
                }}
              >
                <svg width="120" height="50" viewBox="0 0 120 50">
                  <ellipse cx="30" cy="30" rx="30" ry="20" fill="white" opacity="0.8"/>
                  <ellipse cx="55" cy="27" rx="35" ry="22" fill="white" opacity="0.85"/>
                  <ellipse cx="80" cy="30" rx="30" ry="20" fill="white" opacity="0.8"/>
                  <ellipse cx="95" cy="33" rx="25" ry="17" fill="white" opacity="0.75"/>
                </svg>
              </div>
            ))}
          </div>

          {/* Sunlight rays effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/20 via-transparent to-transparent pointer-events-none"></div>
        </div>
        
        {/* Decorative Flowers - Top */}
        <div className="fixed top-0 left-0 right-0 h-48 opacity-40 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 1200 250" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="flowerGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g>
              {/* Large Hibiscus-style flowers */}
              {[...Array(10)].map((_, i) => (
                <g key={`flower-${i}`} transform={`translate(${i * 120 + 60}, ${30 + Math.sin(i) * 20}) rotate(${i * 30})`} filter="url(#flowerGlow)">
                  {/* Petals */}
                  {[...Array(5)].map((_, p) => (
                    <ellipse
                      key={`petal-${p}`}
                      cx="0"
                      cy="-15"
                      rx="12"
                      ry="20"
                      fill={i % 3 === 0 ? "#d946ef" : i % 3 === 1 ? "#ec4899" : "#c084fc"}
                      opacity="0.8"
                      transform={`rotate(${p * 72})`}
                    />
                  ))}
                  {/* Center */}
                  <circle cx="0" cy="0" r="6" fill="#fbbf24" opacity="0.9" />
                  <circle cx="0" cy="0" r="3" fill="#f59e0b" opacity="1" />
                </g>
              ))}
              
              {/* Palm fronds and tropical leaves */}
              {[...Array(12)].map((_, i) => (
                <g key={`leaf-${i}`} transform={`translate(${i * 100 + 40}, ${60 + i * 5}) rotate(${i * 20 - 60})`}>
                  <path
                    d="M0,0 Q-8,25 -10,50 L-8,52 L0,50 L8,52 L10,50 Q8,25 0,0"
                    fill="#a78bfa"
                    opacity="0.7"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                  />
                  {/* Leaf veins */}
                  <line x1="0" y1="0" x2="0" y2="50" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
                </g>
              ))}

              {/* Small detail flowers */}
              {[...Array(15)].map((_, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={i * 80 + 30}
                  cy={Math.random() * 100 + 30}
                  r={Math.random() * 4 + 3}
                  fill={i % 2 === 0 ? "#f0abfc" : "#e879f9"}
                  opacity="0.7"
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Decorative Flowers - Bottom */}
        <div className="fixed bottom-0 left-0 right-0 h-64 opacity-40 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c026d3" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            <g>
              {/* Large tropical palm leaves - Bottom Right */}
              {[...Array(4)].map((_, i) => (
                <g key={`palm-right-${i}`} transform={`translate(${1100 - i * 80}, ${250 - i * 30}) rotate(${-30 + i * 15})`}>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="60"
                    ry="90"
                    fill="url(#leafGradient)"
                    opacity="0.85"
                  />
                  {/* Leaf details */}
                  <path
                    d="M0,-80 Q-20,-40 -25,0 Q-20,40 0,80"
                    stroke="#9333ea"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.6"
                  />
                </g>
              ))}

              {/* Large tropical palm leaves - Bottom Left */}
              {[...Array(4)].map((_, i) => (
                <g key={`palm-left-${i}`} transform={`translate(${100 + i * 80}, ${250 - i * 30}) rotate(${30 - i * 15})`}>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="60"
                    ry="90"
                    fill="url(#leafGradient)"
                    opacity="0.85"
                  />
                  <path
                    d="M0,-80 Q20,-40 25,0 Q20,40 0,80"
                    stroke="#9333ea"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.6"
                  />
                </g>
              ))}

              {/* Large blooming flowers */}
              {[...Array(6)].map((_, i) => (
                <g key={`bottom-flower-${i}`} transform={`translate(${i * 200 + 150}, ${220 + Math.sin(i) * 30})`}>
                  {/* Flower petals */}
                  {[...Array(8)].map((_, p) => (
                    <ellipse
                      key={`b-petal-${p}`}
                      cx="0"
                      cy="-25"
                      rx="18"
                      ry="30"
                      fill={p % 2 === 0 ? "#f0abfc" : "#d946ef"}
                      opacity="0.85"
                      transform={`rotate(${p * 45})`}
                      stroke="#c026d3"
                      strokeWidth="2"
                    />
                  ))}
                  {/* Flower center */}
                  <circle cx="0" cy="0" r="12" fill="#fbbf24" opacity="0.95" />
                  <circle cx="0" cy="0" r="6" fill="#f59e0b" opacity="1" />
                </g>
              ))}

              {/* Fern-like leaves */}
              {[...Array(10)].map((_, i) => (
                <g key={`fern-${i}`} transform={`translate(${i * 120 + 80}, 250) rotate(${i * 15 - 75})`}>
                  <path
                    d="M0,0 L-5,40 L-8,45 L0,42 L8,45 L5,40 Z"
                    fill="#a78bfa"
                    opacity="0.75"
                    stroke="#8b5cf6"
                    strokeWidth="1.5"
                  />
                  {/* Secondary fronds */}
                  <path
                    d="M-5,20 L-15,25 M5,20 L15,25 M-5,30 L-12,35 M5,30 L12,35"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.6"
                  />
                </g>
              ))}

              {/* Decorative small flowers scattered */}
              {[...Array(20)].map((_, i) => (
                <g key={`scatter-${i}`} transform={`translate(${Math.random() * 1200}, ${Math.random() * 100 + 180})`}>
                  <circle cx="0" cy="0" r="5" fill="#f0abfc" opacity="0.8" />
                  <circle cx="0" cy="0" r="2" fill="#fbbf24" opacity="1" />
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Header with Logo */}
        <header className="relative z-10 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-md text-white py-6 shadow-2xl">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Rimo Store" 
                  className="h-12 w-12 object-contain drop-shadow-2xl"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold drop-shadow-lg">ريمو ستور</h1>
                  <p className="text-blue-100 text-sm">تصميم تجريبي - سماء وسحاب</p>
                </div>
              </div>
              <Link 
                href="/"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition text-sm md:text-base shadow-lg"
              >
                العودة للصفحة الأصلية
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section with soft background */}
        <section className="relative z-10 py-12 bg-white/50 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  أهلاً بك في عالم الأناقة
                </span>
              </h2>
              <p className="text-gray-700 text-lg font-medium">اكتشفي أحدث صيحات الموضة والأزياء العصرية</p>
            </div>
            <HeroSlider />
          </div>
        </section>

        {/* Flash Deals */}
        <div className="relative z-10">
          <FlashDeals />
        </div>

        {/* Products Section */}
        <section className="relative z-10 py-16 bg-white/40 backdrop-blur-md shadow-inner">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-md">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  أحدث المنتجات
                </span>
              </h2>
              <p className="text-gray-700 font-medium">تصفحي مجموعتنا الحصرية</p>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-16">
                  {products.slice(0, 8).map((product, index) => (
                    <div key={product.id} className="bg-white/70 backdrop-blur-md rounded-2xl p-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                      <ProductCardPro product={product} index={index} />
                    </div>
                  ))}
                </div>

                <div className="mb-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
                        تصفح المزيد
                      </span>
                    </h3>
                    <p className="text-gray-700 font-medium">اسحب لاستكشاف المزيد من العروض</p>
                  </div>
                  <ProductsSlider products={products} direction="rtl" />
                </div>
              </>
            ) : (
              <div className="text-center py-24 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl">
                <ShoppingBag className="w-20 h-20 mx-auto text-blue-400 mb-4" />
                <p className="text-gray-800 text-xl mb-2 font-semibold">لا توجد منتجات متاحة حالياً</p>
                <p className="text-gray-600">سيتم إضافة منتجات جديدة قريباً</p>
              </div>
            )}

            <div className="text-center mt-14">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-full font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 text-lg"
              >
                <span>عرض جميع المنتجات</span>
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="relative z-10 py-16">
            <div className="container mx-auto px-4">
              <CategoriesSection categories={categories} />
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-8 my-8 py-6 px-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 text-blue-700">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold">ضمان جودة 100%</span>
                </div>
                <div className="flex items-center gap-2 text-purple-700">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold">شحن سريع لجميع المحافظات</span>
                </div>
                <div className="flex items-center gap-2 text-pink-700">
                  <Award className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-bold">منتجات أصلية</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="relative z-10 bg-gradient-to-r from-blue-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md text-white py-12 mt-16 shadow-2xl">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-6 h-6 text-blue-300" />
                  <h3 className="text-xl font-bold">ريمو ستور</h3>
                </div>
                <p className="text-blue-100 text-sm">
                  وجهتك الأولى للتسوق الإلكتروني - نوفر لك أفضل المنتجات بأفضل الأسعار.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-300">روابط سريعة</h4>
                <div className="flex flex-col gap-2 text-sm text-blue-100">
                  <Link href="/products" className="hover:text-white transition">جميع المنتجات</Link>
                  <Link href="/cart" className="hover:text-white transition">سلة التسوق</Link>
                  <Link href="/wishlist" className="hover:text-white transition">المفضلة</Link>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-purple-300">خدمة العملاء</h4>
                <div className="flex flex-col gap-2 text-sm text-purple-100">
                  <Link href="/about" className="hover:text-white transition">من نحن</Link>
                  <Link href="/contact" className="hover:text-white transition">اتصل بنا</Link>
                  <Link href="/faq" className="hover:text-white transition">الأسئلة الشائعة</Link>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-pink-300">تواصل معنا</h4>
                <div className="flex flex-col gap-2 text-sm text-pink-100">
                  <p>📱 01555512778</p>
                  <p>📧 akram.er2025@gmail.com</p>
                  <p>📍 مصر - القاهرة</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-blue-700/50 text-center">
              <p className="text-sm text-blue-200 mb-2">
                © 2026 ريمو ستور. جميع الحقوق محفوظة.
              </p>
              <p className="text-xs text-blue-300">
                تصميم تجريبي - Developed by <span className="text-pink-300 font-semibold">Eng/ Akram Elmasry</span>
              </p>
            </div>
          </div>
        </footer>

        <ChatButton />
      </div>
    );
  } catch (error) {
    console.error('Error rendering test design page:', error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-pink-200 flex items-center justify-center relative overflow-hidden">
        {/* Error clouds */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 animate-float-slow opacity-60">
            <svg width="200" height="80" viewBox="0 0 200 80">
              <ellipse cx="50" cy="50" rx="50" ry="35" fill="white" opacity="0.9"/>
              <ellipse cx="90" cy="45" rx="55" ry="38" fill="white" opacity="0.95"/>
              <ellipse cx="130" cy="48" rx="50" ry="32" fill="white" opacity="0.9"/>
            </svg>
          </div>
        </div>
        
        <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl max-w-md relative z-10">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">⚠️ حدث خطأ</h1>
          <p className="text-gray-700 mb-6">
            عذراً، حدث خطأ أثناء تحميل الصفحة.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }
}
