"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// ===========================================
// DATA & TRANSLATIONS
// ===========================================

const CURRENCIES = [
  // Middle East & North Africa
  { code: 'SAR', symbol: 'ر.س', symbolEn: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', flag: '🇸🇦', rate: 1 },
  { code: 'AED', symbol: 'د.إ', symbolEn: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', flag: '🇦🇪', rate: 0.98 },
  { code: 'EGP', symbol: 'ج.م', symbolEn: 'EGP', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', flag: '🇪🇬', rate: 13.2 },
  { code: 'KWD', symbol: 'د.ك', symbolEn: 'KWD', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', flag: '🇰🇼', rate: 0.082 },
  { code: 'QAR', symbol: 'ر.ق', symbolEn: 'QAR', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', flag: '🇶🇦', rate: 0.97 },
  { code: 'BHD', symbol: 'د.ب', symbolEn: 'BHD', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar', flag: '🇧🇭', rate: 0.10 },
  { code: 'OMR', symbol: 'ر.ع', symbolEn: 'OMR', nameAr: 'ريال عماني', nameEn: 'Omani Rial', flag: '🇴🇲', rate: 0.10 },
  { code: 'JOD', symbol: 'د.أ', symbolEn: 'JOD', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar', flag: '🇯🇴', rate: 0.19 },
  { code: 'USD', symbol: '$', symbolEn: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', flag: '🇺🇸', rate: 0.27 },
  { code: 'EUR', symbol: '€', symbolEn: '€', nameAr: 'يورو', nameEn: 'Euro', flag: '🇪🇺', rate: 0.25 },
  { code: 'GBP', symbol: '£', symbolEn: '£', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', flag: '🇬🇧', rate: 0.21 },
]

const PLATFORMS = [
  { id: 'salla', value: '2.5', nameAr: 'سلة (2.5%)', nameEn: 'Salla (2.5%)', rate: 2.5 },
  { id: 'zid', value: '2.7', nameAr: 'زد (2.7%)', nameEn: 'Zid (2.7%)', rate: 2.7 },
  { id: 'woocommerce', value: '2.9', nameAr: 'ووكومرس (2.9%)', nameEn: 'WooCommerce (2.9%)', rate: 2.9 },
  { id: 'shopify', value: '2.9', nameAr: 'شوبيفاي (2.9%)', nameEn: 'Shopify (2.9%)', rate: 2.9 },
  { id: 'none', value: '0', nameAr: 'بدون عمولة', nameEn: 'No Commission', rate: 0 },
  { id: 'custom', value: 'custom', nameAr: 'مخصص...', nameEn: 'Custom...', rate: 0 },
]

const translations = {
  ar: {
    title: "حاسبة التسعير",
    subtitle: "للتجارة الإلكترونية",
    tagline: "احسب سعر البيع المثالي لمنتجاتك في ثوانٍ",
    productData: "بيانات المنتج",
    productCost: "تكلفة المنتج",
    productCostHint: "سعر شراء المنتج من المورد",
    shippingCost: "تكلفة الشحن",
    shippingCostHint: "تكلفة شحن المنتج للعميل",
    platform: "المنصة",
    customCommission: "عمولة مخصصة",
    adCost: "تكلفة الإعلان",
    adCostHint: "متوسط تكلفة الإعلان لكل طلب",
    packagingCost: "تكلفة التغليف",
    packagingCostHint: "تكلفة التغليف والكرتون",
    mediaBuyerCommission: "نسبة الميديا باير",
    mediaBuyerCommissionHint: "نسبة عمولة الميديا باير من المبيعات",
    returns: "المرتجعات",
    returnsEnabled: "تفعيل المرتجعات",
    returnRate: "نسبة المرتجعات",
    returnRateHint: "نسبة المنتجات المرتجعة المتوقعة",
    vat: "ضريبة القيمة المضافة",
    vatPercent: "نسبة الضريبة",
    profitMargin: "هامش الربح المطلوب:",
    results: "النتائج",
    suggestedPrice: "سعر البيع المقترح",
    vatIncluded: "شامل ضريبة القيمة المضافة",
    netProfit: "صافي الربح",
    totalCost: "إجمالي التكلفة",
    breakeven: "نقطة التعادل",
    actualMargin: "هامش الربح الفعلي",
    costBreakdown: "تفصيل التكاليف",
    returnLosses: "خسائر المرتجعات",
    mediaBuyerCost: "عمولة الميديا باير",
    backToDev: "العودة للوحة التحكم",
    backToAdmin: "العودة للوحة الإدارة",
    backToVendor: "العودة للوحة الشريك",
  },
  en: {
    title: "Pricing Calculator",
    subtitle: "For E-commerce",
    tagline: "Calculate the optimal selling price for your products in seconds",
    productData: "Product Data",
    productCost: "Product Cost",
    productCostHint: "Purchase price from supplier",
    shippingCost: "Shipping Cost",
    shippingCostHint: "Shipping cost to customer",
    platform: "Platform",
    customCommission: "Custom Commission",
    adCost: "Ad Cost",
    adCostHint: "Average ad cost per order",
    packagingCost: "Packaging Cost",
    packagingCostHint: "Packaging and box cost",
    mediaBuyerCommission: "Media Buyer Commission",
    mediaBuyerCommissionHint: "Media buyer commission % from sales",
    returns: "Returns",
    returnsEnabled: "Enable Returns",
    returnRate: "Return Rate",
    returnRateHint: "Expected product return rate",
    vat: "Value Added Tax",
    vatPercent: "Tax Rate",
    profitMargin: "Desired Profit Margin:",
    results: "Results",
    suggestedPrice: "Suggested Selling Price",
    vatIncluded: "Including VAT",
    netProfit: "Net Profit",
    totalCost: "Total Cost",
    breakeven: "Break-even Point",
    actualMargin: "Actual Profit Margin",
    costBreakdown: "Cost Breakdown",
    returnLosses: "Return Losses",
    mediaBuyerCost: "Media Buyer Cost",
    backToDev: "Back to Dashboard",
    backToAdmin: "Back to Admin Dashboard",
    backToVendor: "Back to Vendor Dashboard",
  }
}

export default function ProductPricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Settings
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [platform, setPlatform] = useState('2.5')
  const [showCustomCommission, setShowCustomCommission] = useState(false)

  // Inputs
  const [productCost, setProductCost] = useState(50)
  const [shippingCost, setShippingCost] = useState(20)
  const [customCommission, setCustomCommission] = useState(2.5)
  const [adCost, setAdCost] = useState(15)
  const [packagingCost, setPackagingCost] = useState(5)
  const [mediaBuyerCommission, setMediaBuyerCommission] = useState(10)
  const [returnsEnabled, setReturnsEnabled] = useState(false)
  const [returnRate, setReturnRate] = useState(5)
  const [vatEnabled, setVatEnabled] = useState(true)
  const [vatPercent, setVatPercent] = useState(15)
  const [profitMargin, setProfitMargin] = useState(30)

  // Results
  const [results, setResults] = useState({
    sellingPrice: 0,
    netProfit: 0,
    totalCost: 0,
    breakeven: 0,
    actualMargin: 0,
    breakdown: {
      product: 0,
      shipping: 0,
      commission: 0,
      ads: 0,
      packaging: 0,
      mediaBuyer: 0,
      returnLosses: 0,
      vat: 0,
      profit: 0,
    }
  })

  // Auth check
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/login")
      return
    }
    if (session.user.role !== "DEVELOPER" && session.user.role !== "ADMIN" && session.user.role !== "VENDOR") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // Handle platform change
  useEffect(() => {
    setShowCustomCommission(platform === 'custom')
  }, [platform])

  // Calculate pricing
  useEffect(() => {
    calculate()
  }, [productCost, shippingCost, platform, customCommission, adCost, packagingCost, mediaBuyerCommission, returnsEnabled, returnRate, vatEnabled, vatPercent, profitMargin])

  const getCommissionRate = () => {
    if (platform === 'custom') return customCommission
    return parseFloat(platform)
  }

  const calculate = () => {
    // التكاليف الأساسية المباشرة
    const directCosts = productCost + shippingCost + adCost + packagingCost
    const commissionRate = getCommissionRate()
    const commissionDecimal = commissionRate / 100
    const mediaBuyerDecimal = mediaBuyerCommission / 100
    
    // حساب خسائر المرتجعات المتوقعة (نسبة من تكاليف المنتج + شحن + تغليف)
    // المرتجعات تخسرك: المنتج + الشحن + التغليف
    const returnableCosts = productCost + shippingCost + packagingCost
    const returnLosses = returnsEnabled ? (returnableCosts * (returnRate / 100)) : 0
    
    // إجمالي التكاليف مع المرتجعات
    const totalCostsWithReturns = directCosts + returnLosses
    
    // الربح المطلوب (بناءً على التكاليف الأساسية فقط)
    const desiredProfit = directCosts * (profitMargin / 100)
    
    // السعر قبل الضريبة (مع تغطية عمولة المنصة والميديا باير)
    // السعر = (التكاليف + الربح) / (1 - نسبة المنصة - نسبة الميديا باير)
    const priceBeforeVat = (totalCostsWithReturns + desiredProfit) / (1 - commissionDecimal - mediaBuyerDecimal)
    
    // حساب العمولات والتكاليف الفعلية
    const commissionAmount = priceBeforeVat * commissionDecimal
    const mediaBuyerAmount = priceBeforeVat * mediaBuyerDecimal
    const vatAmount = vatEnabled ? priceBeforeVat * (vatPercent / 100) : 0
    const finalPrice = priceBeforeVat + vatAmount
    
    // التكلفة الإجمالية الفعلية
    const totalCost = productCost + shippingCost + adCost + packagingCost + commissionAmount + mediaBuyerAmount + returnLosses
    
    // صافي الربح
    const netProfit = priceBeforeVat - totalCost
    
    // نقطة التعادل
    const breakeven = totalCost / (1 - commissionDecimal - mediaBuyerDecimal)
    
    // هامش الربح الفعلي
    const actualMargin = priceBeforeVat > 0 ? (netProfit / priceBeforeVat) * 100 : 0

    setResults({
      sellingPrice: finalPrice,
      netProfit,
      totalCost,
      breakeven,
      actualMargin,
      breakdown: {
        product: productCost,
        shipping: shippingCost,
        commission: commissionAmount,
        ads: adCost,
        packaging: packagingCost,
        mediaBuyer: mediaBuyerAmount,
        returnLosses: returnLosses,
        vat: vatAmount,
        profit: netProfit,
      }
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatWithCurrency = (num: number) => {
    const formatted = formatNumber(num)
    const symbol = language === 'ar' ? currency.symbol : currency.symbolEn
    return `${formatted} ${symbol}`
  }

  const t = translations[language]
  const currencySymbol = language === 'ar' ? currency.symbol : currency.symbolEn
  
  // Dynamic back link based on user role
  const userRole = session?.user?.role
  const backLink = userRole === 'ADMIN' ? '/admin' : userRole === 'VENDOR' ? '/vendor/dashboard' : '/developer'
  const backText = userRole === 'ADMIN' ? t.backToAdmin : userRole === 'VENDOR' ? t.backToVendor : t.backToDev

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || (session.user.role !== "DEVELOPER" && session.user.role !== "ADMIN" && session.user.role !== "VENDOR")) {
    return null
  }

  const total = results.sellingPrice > 0 ? results.sellingPrice : 1
  const getBarWidth = (value: number) => Math.max(0, Math.min(100, (value / total) * 100))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden" style={{ 
      fontFamily: language === 'ar' ? "'Cairo', 'Tajawal', sans-serif" : "'Inter', sans-serif",
      direction: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {/* Background Effects - متناسق مع التطبيق */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header - نفس ستايل لوحة الإدارة */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-3 sm:py-4 md:py-6 shadow-2xl">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href={backLink} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg">{t.title}</h1>
                <p className="text-purple-100 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">{t.subtitle}</p>
              </div>
            </div>
            {/* Language & Currency Switchers */}
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 bg-white/10 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/20">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                className="bg-white/20 border border-white/30 rounded-md sm:rounded-lg px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 text-white text-[10px] sm:text-xs md:text-sm outline-none focus:bg-white/30 transition-all cursor-pointer"
              >
                <option value="ar" className="bg-gray-800">🇸🇦 العربية</option>
                <option value="en" className="bg-gray-800">🇬🇧 English</option>
              </select>
              <select 
                value={currency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find(c => c.code === e.target.value)
                  if (selected) setCurrency(selected)
                }}
                className="bg-white/20 border border-white/30 rounded-md sm:rounded-lg px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 text-white text-[10px] sm:text-xs md:text-sm outline-none focus:bg-white/30 transition-all cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-gray-800">
                    {c.flag} {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6 lg:py-8 relative z-10">
        {/* Tagline */}
        <div className="text-center mb-4 sm:mb-5 md:mb-6">
          <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2">{t.tagline}</p>
        </div>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Input Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-500/30 shadow-2xl hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-purple-500/30">
              <span className="text-xl sm:text-2xl">📝</span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{t.productData}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Product Cost */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">📦</span> {t.productCost}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={productCost}
                    onChange={(e) => {
                      const val = e.target.value
                      setProductCost(val === '' ? 0 : parseFloat(val))
                    }}
                    className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                  />
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs sm:text-sm">{currencySymbol}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">{t.productCostHint}</span>
              </div>

              {/* Shipping Cost */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">🚚</span> {t.shippingCost}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={shippingCost}
                    onChange={(e) => {
                      const val = e.target.value
                      setShippingCost(val === '' ? 0 : parseFloat(val))
                    }}
                    className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                  />
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs sm:text-sm">{currencySymbol}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">{t.shippingCostHint}</span>
              </div>

              {/* Platform */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">🏪</span> {t.platform}
                </label>
                <div className="relative">
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-8 sm:px-10 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all appearance-none cursor-pointer text-sm sm:text-base"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.value}>
                        {language === 'ar' ? p.nameAr : p.nameEn}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] sm:text-xs pointer-events-none">▼</span>
                </div>
              </div>

              {/* Custom Commission */}
              {showCustomCommission && (
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg">⚙️</span> {t.customCommission}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={customCommission}
                      onChange={(e) => {
                        const val = e.target.value
                        setCustomCommission(val === '' ? 0 : parseFloat(val))
                      }}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                    />
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs sm:text-sm">%</span>
                  </div>
                </div>
              )}

              {/* Ad Cost */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">📢</span> {t.adCost}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={adCost}
                    onChange={(e) => {
                      const val = e.target.value
                      setAdCost(val === '' ? 0 : parseFloat(val))
                    }}
                    className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">{currencySymbol}</span>
                </div>
                <span className="text-xs text-gray-500">{t.adCostHint}</span>
              </div>

              {/* Packaging Cost */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm flex items-center gap-2">
                  <span>🎁</span> {t.packagingCost}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={packagingCost}
                    onChange={(e) => {
                      const val = e.target.value
                      setPackagingCost(val === '' ? 0 : parseFloat(val))
                    }}
                    className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">{currencySymbol}</span>
                </div>
                <span className="text-xs text-gray-500">{t.packagingCostHint}</span>
              </div>

              {/* Media Buyer Commission */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm flex items-center gap-2">
                  <span>💼</span> {t.mediaBuyerCommission}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={mediaBuyerCommission}
                    onChange={(e) => {
                      const val = e.target.value
                      setMediaBuyerCommission(val === '' ? 0 : parseFloat(val))
                    }}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">%</span>
                </div>
                <span className="text-xs text-gray-500">{t.mediaBuyerCommissionHint}</span>
              </div>

              {/* Returns Toggle */}
              <div className="col-span-full flex items-center justify-between bg-gray-700/70 rounded-xl p-4">
                <label className="text-gray-300 flex items-center gap-2">
                  <span>↩️</span> {t.returnsEnabled} ({returnRate}%)
                </label>
                <button
                  onClick={() => setReturnsEnabled(!returnsEnabled)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    returnsEnabled ? 'bg-[#6366f1]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      returnsEnabled ? (language === 'ar' ? '-translate-x-7' : 'translate-x-7') : (language === 'ar' ? '-translate-x-1' : 'translate-x-1')
                    }`}
                  />
                </button>
              </div>

              {/* Return Rate */}
              {returnsEnabled && (
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-sm flex items-center gap-2">
                    <span>📉</span> {t.returnRate}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={returnRate}
                      onChange={(e) => {
                        const val = e.target.value
                        setReturnRate(val === '' ? 0 : parseFloat(val))
                      }}
                      min="0"
                      max="100"
                      step="1"
                      className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">%</span>
                  </div>
                  <span className="text-xs text-gray-500">{t.returnRateHint}</span>
                </div>
              )}

              {/* VAT Toggle */}
              <div className="col-span-full flex items-center justify-between bg-gray-700/70 rounded-xl p-4">
                <label className="text-gray-300 flex items-center gap-2">
                  <span>🧾</span> {t.vat} ({vatPercent}%)
                </label>
                <button
                  onClick={() => setVatEnabled(!vatEnabled)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    vatEnabled ? 'bg-[#6366f1]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      vatEnabled ? (language === 'ar' ? '-translate-x-7' : 'translate-x-7') : (language === 'ar' ? '-translate-x-1' : 'translate-x-1')
                    }`}
                  />
                </button>
              </div>

              {/* VAT Percent */}
              {vatEnabled && (
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-sm flex items-center gap-2">
                    <span>📊</span> {t.vatPercent}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={vatPercent}
                      onChange={(e) => {
                        const val = e.target.value
                        setVatPercent(val === '' ? 0 : parseFloat(val))
                      }}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full bg-gray-700/70 border border-purple-400/30 rounded-xl px-12 sm:px-14 py-2.5 sm:py-3 text-white font-semibold outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm sm:text-base"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">%</span>
                  </div>
                </div>
              )}

              {/* Profit Margin Slider */}
              <div className="col-span-full flex flex-col gap-2">
                <label className="text-gray-400 text-sm flex items-center gap-2">
                  <span>💎</span> {t.profitMargin} <span className="font-bold text-white">{profitMargin}%</span>
                </label>
                <input 
                  type="range" 
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value))}
                  min="5"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-gray-700/70 rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-500/30 shadow-2xl hover:border-purple-500/50 transition-all flex flex-col">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-purple-500/30">
              <span className="text-xl sm:text-2xl">📊</span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{t.results}</h2>
            </div>

            {/* Main Result */}
            <div className="text-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl mb-4 sm:mb-6" style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)' 
            }}>
              <div className="text-gray-400 text-xs sm:text-sm mb-2">{t.suggestedPrice}</div>
              <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#818cf8] to-[#34d399] bg-clip-text text-transparent">
                  {formatNumber(results.sellingPrice)}
                </span>
                <span className="text-xl sm:text-2xl text-gray-400">{currencySymbol}</span>
              </div>
              {vatEnabled && (
                <div className="text-[10px] sm:text-xs text-[#10b981] mt-2">{t.vatIncluded}</div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-700/70 rounded-lg sm:rounded-xl hover:-translate-y-1 transition-transform">
                <div className="text-lg sm:text-xl md:text-2xl">💵</div>
                <div>
                  <div className="text-base sm:text-lg md:text-xl font-bold text-[#10b981]">{formatNumber(results.netProfit)} <small className="text-[10px] sm:text-xs md:text-sm">{currencySymbol}</small></div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{t.netProfit}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-700/70 rounded-lg sm:rounded-xl hover:-translate-y-1 transition-transform">
                <div className="text-lg sm:text-xl md:text-2xl">📉</div>
                <div>
                  <div className="text-base sm:text-lg md:text-xl font-bold text-[#ef4444]">{formatNumber(results.totalCost)} <small className="text-[10px] sm:text-xs md:text-sm">{currencySymbol}</small></div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{t.totalCost}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-700/70 rounded-lg sm:rounded-xl hover:-translate-y-1 transition-transform">
                <div className="text-lg sm:text-xl md:text-2xl">⚖️</div>
                <div>
                  <div className="text-base sm:text-lg md:text-xl font-bold">{formatNumber(results.breakeven)} <small className="text-[10px] sm:text-xs md:text-sm">{currencySymbol}</small></div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{t.breakeven}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-700/70 rounded-lg sm:rounded-xl hover:-translate-y-1 transition-transform">
                <div className="text-lg sm:text-xl md:text-2xl">📈</div>
                <div>
                  <div className="text-base sm:text-lg md:text-xl font-bold">{formatNumber(results.actualMargin)}%</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{t.actualMargin}</div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mt-auto">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-3 sm:mb-4">{t.costBreakdown}</h3>
              <div className="space-y-2 sm:space-y-3">
                <BreakdownBar icon="📦" label={t.productCost} value={formatWithCurrency(results.breakdown.product)} percentage={getBarWidth(results.breakdown.product)} color="linear-gradient(90deg, #6366f1, #818cf8)" />
                <BreakdownBar icon="🚚" label={t.shippingCost} value={formatWithCurrency(results.breakdown.shipping)} percentage={getBarWidth(results.breakdown.shipping)} color="linear-gradient(90deg, #f59e0b, #fbbf24)" />
                <BreakdownBar icon="🏪" label={t.platform} value={formatWithCurrency(results.breakdown.commission)} percentage={getBarWidth(results.breakdown.commission)} color="linear-gradient(90deg, #ef4444, #f87171)" />
                <BreakdownBar icon="📢" label={t.adCost} value={formatWithCurrency(results.breakdown.ads)} percentage={getBarWidth(results.breakdown.ads)} color="linear-gradient(90deg, #8b5cf6, #a78bfa)" />
                <BreakdownBar icon="🎁" label={t.packagingCost} value={formatWithCurrency(results.breakdown.packaging)} percentage={getBarWidth(results.breakdown.packaging)} color="linear-gradient(90deg, #ec4899, #f472b6)" />
                {mediaBuyerCommission > 0 && (
                  <BreakdownBar icon="💼" label={t.mediaBuyerCost} value={formatWithCurrency(results.breakdown.mediaBuyer)} percentage={getBarWidth(results.breakdown.mediaBuyer)} color="linear-gradient(90deg, #06b6d4, #22d3ee)" />
                )}
                {returnsEnabled && results.breakdown.returnLosses > 0 && (
                  <BreakdownBar icon="↩️" label={t.returnLosses} value={formatWithCurrency(results.breakdown.returnLosses)} percentage={getBarWidth(results.breakdown.returnLosses)} color="linear-gradient(90deg, #dc2626, #ef4444)" />
                )}
                {vatEnabled && (
                  <BreakdownBar icon="🧾" label={t.vat} value={formatWithCurrency(results.breakdown.vat)} percentage={getBarWidth(results.breakdown.vat)} color="linear-gradient(90deg, #71717a, #a1a1aa)" />
                )}
                <BreakdownBar icon="💎" label={t.netProfit} value={formatWithCurrency(results.breakdown.profit)} percentage={getBarWidth(results.breakdown.profit)} color="linear-gradient(90deg, #10b981, #34d399)" isProfit />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 text-sm space-y-2">
          <p>{language === 'ar' ? 'صُمم بـ ❤️ للتجارة الإلكترونية' : 'Made with ❤️ for E-commerce'}</p>
          <p className="text-xs">© 2026 {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.02); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 20s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

function BreakdownBar({ icon, label, value, percentage, color, isProfit = false }: {
  icon: string
  label: string
  value: string
  percentage: number
  color: string
  isProfit?: boolean
}) {
  return (
    <div className="space-y-0.5 sm:space-y-1">
      <div className="flex justify-between text-[10px] sm:text-xs">
        <span className={isProfit ? 'text-[#10b981] font-semibold' : 'text-gray-400'}>
          <span className="text-xs sm:text-sm">{icon}</span> {label}
        </span>
        <span className={isProfit ? 'text-[#10b981] font-semibold' : 'text-gray-500'}>
          {value}
        </span>
      </div>
      <div className="h-1.5 sm:h-2 bg-gray-700/70 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: color
          }}
        />
      </div>
    </div>
  )
}
