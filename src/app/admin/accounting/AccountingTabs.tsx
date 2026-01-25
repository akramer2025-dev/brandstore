"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddVoucherButton } from "./AccountingActions";
import Link from "next/link";

export function AccountingTabs({ vouchers, orders }: any) {
  const receiptVouchers = vouchers.filter((v: any) => v.type === "RECEIPT");
  const paymentVouchers = vouchers.filter((v: any) => v.type === "PAYMENT");

  const totalReceipts = receiptVouchers
    .filter((v: any) => v.status === "PAID")
    .reduce((sum: number, v: any) => sum + v.amount, 0);

  const totalPayments = paymentVouchers
    .filter((v: any) => v.status === "PAID")
    .reduce((sum: number, v: any) => sum + v.amount, 0);

  const netBalance = totalReceipts - totalPayments;

  const pendingReceipts = receiptVouchers.filter((v: any) => v.status === "PENDING").length;
  const pendingPayments = paymentVouchers.filter((v: any) => v.status === "PENDING").length;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 backdrop-blur-sm shadow-xl h-14">
        <TabsTrigger value="overview" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white">
          <FileText className="w-5 h-5 ml-2" />
          نظرة عامة
        </TabsTrigger>
        <TabsTrigger value="receipts" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
          <TrendingUp className="w-5 h-5 ml-2" />
          سندات القبض
        </TabsTrigger>
        <TabsTrigger value="payments" className="text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
          <TrendingDown className="w-5 h-5 ml-2" />
          سندات الصرف
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/admin/purchase-vouchers">
              <Card className="backdrop-blur-sm bg-gradient-to-r from-teal-600 to-cyan-600 border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm opacity-90">سندات الصرف والمشتريات</p>
                      <p className="text-2xl font-bold mt-1">إدارة سندات الصرف</p>
                      <p className="text-xs opacity-75 mt-2">شراء المواد الخام والأصناف</p>
                    </div>
                    <ShoppingCart className="w-16 h-16 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/raw-materials">
              <Card className="backdrop-blur-sm bg-gradient-to-r from-purple-600 to-pink-600 border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm opacity-90">مخزون المواد والأصناف</p>
                      <p className="text-2xl font-bold mt-1">المواد الخام</p>
                      <p className="text-xs opacity-75 mt-2">أقمشة، إكسسوارات، خيوط</p>
                    </div>
                    <Package className="w-16 h-16 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Financial Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">إجمالي القبض</p>
                    <p className="text-3xl font-bold text-green-600">{totalReceipts.toFixed(0)} ج</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">إجمالي الصرف</p>
                    <p className="text-3xl font-bold text-red-600">{totalPayments.toFixed(0)} ج</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">الرصيد الصافي</p>
                    <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netBalance.toFixed(0)} ج
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">معاملات معلقة</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingReceipts + pendingPayments}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>آخر المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vouchers.slice(0, 10).map((voucher: any) => (
                  <div key={voucher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {voucher.type === "RECEIPT" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-bold">
                          {voucher.type === "RECEIPT" ? "سند قبض" : "سند صرف"} #{voucher.voucherNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {voucher.description || (voucher.type === "RECEIPT" ? voucher.payerName : voucher.recipientName)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-xl font-bold ${voucher.type === "RECEIPT" ? 'text-green-600' : 'text-red-600'}`}>
                        {voucher.type === "RECEIPT" ? '+' : '-'}{voucher.amount} ج
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(voucher.transactionDate).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        voucher.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : voucher.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {voucher.status === "PAID" && "تم"}
                      {voucher.status === "PENDING" && "معلق"}
                      {voucher.status === "APPROVED" && "موافق"}
                      {voucher.status === "REJECTED" && "مرفوض"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Receipts Tab */}
      <TabsContent value="receipts">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">سندات القبض</h2>
            <p className="text-gray-600">
              إجمالي: {receiptVouchers.length} | معلقة: {pendingReceipts}
            </p>
          </div>
          <AddVoucherButton type="RECEIPT" />
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right py-3 px-4">رقم السند</th>
                    <th className="text-right py-3 px-4">الدافع</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">طريقة الدفع</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptVouchers.map((voucher: any) => (
                    <tr key={voucher.id} className="border-b hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">#{voucher.voucherNumber}</td>
                      <td className="py-3 px-4">{voucher.payerName || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-600">{voucher.amount} جنيه</span>
                      </td>
                      <td className="py-3 px-4 text-sm">{voucher.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(voucher.transactionDate).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            voucher.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : voucher.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {voucher.status === "PAID" && "تم القبض"}
                          {voucher.status === "PENDING" && "معلق"}
                          {voucher.status === "APPROVED" && "موافق"}
                          {voucher.status === "REJECTED" && "مرفوض"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Payments Tab */}
      <TabsContent value="payments">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">سندات الصرف</h2>
            <p className="text-gray-600">
              إجمالي: {paymentVouchers.length} | معلقة: {pendingPayments}
            </p>
          </div>
          <AddVoucherButton type="PAYMENT" />
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right py-3 px-4">رقم السند</th>
                    <th className="text-right py-3 px-4">المستلم</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">الفئة</th>
                    <th className="text-right py-3 px-4">طريقة الدفع</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentVouchers.map((voucher: any) => (
                    <tr key={voucher.id} className="border-b hover:bg-red-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">#{voucher.voucherNumber}</td>
                      <td className="py-3 px-4">{voucher.recipientName || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-red-600">{voucher.amount} جنيه</span>
                      </td>
                      <td className="py-3 px-4 text-sm">{voucher.category || "-"}</td>
                      <td className="py-3 px-4 text-sm">{voucher.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(voucher.transactionDate).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            voucher.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : voucher.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {voucher.status === "PAID" && "تم الصرف"}
                          {voucher.status === "PENDING" && "معلق"}
                          {voucher.status === "APPROVED" && "موافق"}
                          {voucher.status === "REJECTED" && "مرفوض"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
