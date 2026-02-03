'use client'

import Link from 'next/link'
import { Store, Factory, Truck, FileText, Building2, Pill } from 'lucide-react'

export default function JoinUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity group">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/30 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
              <img 
                src="/logo.png" 
                alt="BS Brand Store" 
                className="w-24 h-24 rounded-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              />
            </div>
            <div className="text-right text-white">
              <h1 className="text-3xl font-black">براند ستور</h1>
              <p className="text-sm opacity-90">انضم كشريك نجاح</p>
            </div>
          </Link>

          <h2 className="text-5xl font-black text-white mb-4">
            انضم إلى عائلتنا 🎉
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            اختر نوع الشراكة المناسب لك وابدأ رحلتك معنا
          </p>
        </div>

        {/* Partner Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Store Owner */}
          <Link
            href="/auth/partner-register?type=store"
            className="group bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-4 border-transparent hover:border-purple-400"
          >
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <Store className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              صاحب محل
            </h3>
            <p className="text-gray-600 text-center mb-4">
              انضم بمتجرك وعرض منتجاتك لآلاف العملاء
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>عمولة 15% فقط</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>دفعات سريعة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>دعم فني مجاني</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition-colors">
                سجل الآن →
              </span>
            </div>
          </Link>

          {/* Factory Owner */}
          <Link
            href="/auth/partner-register?type=factory"
            className="group bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-4 border-transparent hover:border-blue-400"
          >
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <Factory className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              صاحب مصنع
            </h3>
            <p className="text-gray-600 text-center mb-4">
              اعرض منتجاتك المصنعة بجودة عالية
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>كميات كبيرة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>أسعار تنافسية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>عقود طويلة الأجل</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
                سجل الآن →
              </span>
            </div>
          </Link>

          {/* Delivery Driver */}
          <Link
            href="/auth/partner-register?type=delivery"
            className="group bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-4 border-transparent hover:border-green-400"
          >
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <Truck className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              مندوب توصيل
            </h3>
            <p className="text-gray-600 text-center mb-4">
              كن جزءاً من فريق التوصيل السريع
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>دخل يومي ممتاز</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>مرونة في العمل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span>حوافز وبونص</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-semibold group-hover:bg-green-700 transition-colors">
                سجل الآن →
              </span>
            </div>
          </Link>

          {/* Stationery Store */}
          <Link
            href="/auth/partner-register?type=stationery"
            className="group bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-4 border-transparent hover:border-orange-400"
          >
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <FileText className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              مكتبة أدوات مدرسية
            </h3>
            <p className="text-gray-600 text-center mb-4">
              بع الأدوات المدرسية والقرطاسية
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span>موسم المدارس</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span>طلب مستمر</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <span>أرباح جيدة</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold group-hover:bg-orange-700 transition-colors">
                سجل الآن →
              </span>
            </div>
          </Link>

          {/* Pharmacy */}
          <Link
            href="/auth/partner-register?type=pharmacy"
            className="group bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-4 border-transparent hover:border-red-400"
          >
            <div className="bg-gradient-to-br from-red-100 to-pink-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <Pill className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              صيدلية
            </h3>
            <p className="text-gray-600 text-center mb-4">
              بع الأدوية ومنتجات العناية الصحية
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>منتجات صحية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>طلب دائم</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>هامش ربح عالي</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg font-semibold group-hover:bg-red-700 transition-colors">
                سجل الآن →
              </span>
            </div>
          </Link>

          {/* General Store */}
          <Link
            href="/auth/partner-register?type=general"
            className="group bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-4 border-transparent hover:border-indigo-400"
          >
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
              <Building2 className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              محل عام
            </h3>
            <p className="text-gray-600 text-center mb-4">
              بع أي نوع من المنتجات
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <span>تنوع كبير</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <span>مرونة عالية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <span>سهل البدء</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold group-hover:bg-indigo-700 transition-colors">
                سجل الآن →
              </span>
            </div>
          </Link>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-semibold"
          >
            ← العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}
