"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("رابط غير صالح");
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل في تغيير كلمة المرور");
      }

      setSuccess(true);
      toast.success("تم تغيير كلمة المرور بنجاح!");
      
      // التوجيه لصفحة تسجيل الدخول بعد 3 ثواني
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ. يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-green-200">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              تم بنجاح! ✅
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              تم تغيير كلمة المرور بنجاح. جاري التوجيه لصفحة تسجيل الدخول...
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              الانتقال لتسجيل الدخول الآن
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            إعادة تعيين كلمة المرور 🔐
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            اختر كلمة مرور جديدة وقوية لحسابك
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* كلمة المرور الجديدة */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10 pl-10 h-12 text-lg border-2 focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">✓ يجب أن تكون 6 أحرف على الأقل</p>
            </div>

            {/* تأكيد كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10 pl-10 h-12 text-lg border-2 focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {password && confirmPassword && (
              <div className={`text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {password === confirmPassword ? '✓ كلمتا المرور متطابقتان' : '✗ كلمتا المرور غير متطابقتين'}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري التغيير...
                </>
              ) : (
                "تغيير كلمة المرور"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
