import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AccountingTabs } from "./AccountingTabs";
import { prisma } from "@/lib/prisma";

export default async function AccountingPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [vouchers, recentOrders] = await Promise.all([
    prisma.paymentVoucher.findMany({
      orderBy: { transactionDate: "desc" },
      take: 50,
    }),
    prisma.order.findMany({
      where: { status: "DELIVERED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        customer: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للوحة الإدارة
          </Link>
          <h1 className="text-4xl font-bold drop-shadow-lg">
            💰 الحسابات والمالية
          </h1>
          <p className="text-orange-100 mt-2 text-lg">
            سندات القبض والصرف • التقارير المالية
          </p>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <AccountingTabs vouchers={vouchers} orders={recentOrders} />
      </div>
    </div>
  );
}
