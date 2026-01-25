import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowRight, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent leading-none">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent w-32"></div>
            <Package className="w-6 h-6 text-teal-400" />
            <div className="h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent w-32"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          عذراً، الصفحة غير موجودة
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها، أو أن الرابط غير صحيح
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-6 text-lg">
              <Home className="w-5 h-5 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="outline"
              className="border-teal-500/50 hover:bg-teal-500/10 text-gray-300 px-8 py-6 text-lg"
            >
              <Search className="w-5 h-5 ml-2" />
              تصفح المنتجات
            </Button>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-gray-500 mb-4">أو جرب إحدى هذه الروابط:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/cart"
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              السلة
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/orders"
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              طلباتي
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/admin"
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              لوحة الإدارة
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-8 opacity-20">
          <div className="w-24 h-24 border-2 border-teal-500 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 border-2 border-cyan-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-20 h-20 border-2 border-blue-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
