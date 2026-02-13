import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdsPreviewClient } from "./AdsPreviewClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdsPreviewPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white py-6 sm:py-8 md:py-12 shadow-2xl">
        <div className="container mx-auto px-3 sm:px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-cyan-100 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            العودة للوحة الإدارة
          </Link>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg mb-1 sm:mb-2">
                👁️ معاينة الإعلانات
              </h1>
              <p className="text-cyan-100 text-sm sm:text-base md:text-lg lg:text-xl">
                عرض وإدارة جميع الحملات الإعلانية على Facebook مع إمكانية التحكم
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10">
        <AdsPreviewClient />
      </div>
    </div>
  );
}