"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Gift,
  Ticket,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      
      // تحميل الكوبونات
      fetchCoupons();
    }
  }, [session, status, router]);
  
  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const response = await fetch('/api/coupons/my-coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
        setTotalDiscount(data.totalDiscount || 0);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل تحديث البيانات");
      }

      await update();
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "فشل تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل تغيير كلمة المرور");
      }

      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "فشل تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            العودة للرئيسية
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-400">إدارة حسابك وإعداداتك</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    الاسم
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-400" />
                تغيير كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-gray-300">
                    كلمة المرور الحالية
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-gray-300">
                    كلمة المرور الجديدة
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    تأكيد كلمة المرور
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 ml-2" />
                    )}
                    تغيير كلمة المرور
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="bg-gray-800/80 border-teal-500/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white">معلومات الحساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-gray-300">
              <span>نوع الحساب:</span>
              <span className="font-bold text-teal-400">
                {session?.user?.role === "ADMIN"
                  ? "مدير"
                  : session?.user?.role === "DELIVERY_STAFF"
                  ? "موظف توصيل"
                  : "عميل"}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>حالة الحساب:</span>
              <span className="text-green-400 font-bold">نشط</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Coupons Section - رصيد الخصومات */}
        <Card className="bg-gray-800/80 border-teal-500/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              رصيد الخصومات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCoupons ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : coupons.length > 0 ? (
              <>
                {/* Total Discount */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-6 border border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">إجمالي الخصومات المتاحة</p>
                      <p className="text-4xl font-black text-yellow-400">{totalDiscount} جنيه</p>
                    </div>
                    <Ticket className="w-16 h-16 text-yellow-400/30" />
                  </div>
                </div>
                
                {/* Coupons List */}
                <div className="space-y-4">
                  <p className="text-gray-300 font-semibold mb-3">الكوبونات المتاحة ({coupons.length})</p>
                  {coupons.map((coupon) => {
                    const isExpiringSoon = coupon.expiresAt && 
                      new Date(coupon.expiresAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;
                    const isUsed = coupon.usedCount >= coupon.maxUses;
                    
                    return (
                      <div 
                        key={coupon.id}
                        className={`bg-gradient-to-r ${
                          isUsed ? 'from-gray-700/50 to-gray-600/50' : 
                          'from-teal-600/20 to-cyan-600/20'
                        } rounded-lg p-4 border ${
                          isUsed ? 'border-gray-600/30' : 'border-teal-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                                isUsed ? 'bg-gray-600/50 text-gray-400' : 
                                'bg-yellow-500/20 text-yellow-400'
                              } font-bold text-lg`}>
                                <Gift className="w-4 h-4" />
                                {coupon.discount} جنيه
                              </div>
                              {isUsed && (
                                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                  مستخدم
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <ShoppingBag className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">
                                  للشراء بقيمة {coupon.minPurchase} جنيه أو أكثر
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Ticket className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400 font-mono">{coupon.code}</span>
                              </div>
                              
                              {coupon.expiresAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className={isExpiringSoon ? 'text-orange-400' : 'text-gray-400'}>
                                    {isExpiringSoon && '⚠️ '}
                                    صالح حتى {new Date(coupon.expiresAt).toLocaleDateString('ar-EG')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={`text-3xl ${isUsed ? 'opacity-30' : ''}`}>
                            🎁
                          </div>
                        </div>
                        
                        {!isUsed && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-400">
                              💡 استخدم هذا الكود عند الدفع للحصول على الخصم
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">لا توجد خصومات متاحة حالياً</p>
                <p className="text-sm text-gray-500">قم بتدوير عجلة الحظ للحصول على خصومات رائعة! 🎡</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
