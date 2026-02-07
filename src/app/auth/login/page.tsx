'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // إذا المستخدم مسجل دخول، توجيهه للصفحة المناسبة حسب دوره
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('✅ User is already logged in, redirecting based on role:', session.user.role);
      
      // التوجيه حسب نوع المستخدم
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (session.user.role === 'VENDOR') {
        router.push('/vendor/dashboard');
      } else if (session.user.role === 'MANUFACTURER') {
        router.push('/manufacturer/dashboard');
      } else if (session.user.role === 'DELIVERY_STAFF') {
        router.push('/delivery-dashboard');
      } else if (session.user.role === 'MARKETING_STAFF') {
        router.push('/marketing/dashboard');
      } else if (session.user.role === 'CUSTOMER') {
        router.push('/');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      // تسجيل الدخول مع Google - سيتم التوجيه تلقائياً بواسطة useEffect حسب role المستخدم
      await signIn('google', { 
        redirect: false 
      });
      // بعد نجاح تسجيل الدخول، الـ useEffect سيقوم بالتوجيه التلقائي
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('حدث خطأ في تسجيل الدخول بواسطة Google');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        // جلب معلومات المستخدم لتحديد التوجيه
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        // التوجيه حسب نوع المستخدم
        if (sessionData?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else if (sessionData?.user?.role === 'VENDOR') {
          router.push('/vendor/dashboard');
        } else if (sessionData?.user?.role === 'MANUFACTURER') {
          router.push('/manufacturer/dashboard');
        } else if (sessionData?.user?.role === 'DELIVERY_STAFF') {
          router.push('/delivery-dashboard');
        } else if (sessionData?.user?.role === 'CUSTOMER') {
          router.push('/customer');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (error) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // عرض loading أثناء التحقق من session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  // إذا المستخدم مسجل بالفعل، لا تعرض صفحة تسجيل الدخول
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">تم تسجيل الدخول بنجاح! جاري التوجيه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand - Enhanced Design */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            {/* Logo Container with Enhanced Effects */}
            <div className="relative">
              {/* Glow Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 scale-110"></div>
              
              {/* Main Logo Card */}
              <div className="relative bg-white/15 backdrop-blur-xl p-6 rounded-3xl border-2 border-white/40 shadow-2xl transition-all duration-500 group-hover:bg-white/25 group-hover:scale-105 group-hover:border-white/60">
                <div className="flex items-center justify-center gap-4">
                  {/* Logo Image with Animation */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50"></div>
                    <img 
                      src="/logo.png" 
                      alt="BS Brand Store" 
                      className="relative w-24 h-24 rounded-2xl object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] transform transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Brand Text */}
                  <div className="text-right">
                    <h1 className="text-4xl font-black text-white drop-shadow-lg mb-1 tracking-tight">
                      براند ستور
                    </h1>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm font-semibold text-white/90 drop-shadow">تسوق بذكاء</span>
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </div>
                    <p className="text-xs text-white/70 mt-1 font-medium">BS Brand Store</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                تسجيل الدخول
              </CardTitle>
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <CardDescription className="text-base">
              للجميع: العملاء • الإدارة • الشركاء • موظفي التوصيل
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} suppressHydrationWarning>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bs.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-2 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base border-2 focus:border-purple-500 pl-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span>تذكرني</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-600 font-semibold">أو</span>
                </div>
              </div>

              {/* زر تسجيل الدخول بـ Google */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full h-12 text-base font-semibold bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 hover:scale-105 shadow-md"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <FcGoogle className="w-6 h-6 ml-2" />
                    تسجيل الدخول بواسطة Google
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ليس لديك حساب؟{' '}
                <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-bold">
                  سجل كعميل
                </Link>
              </div>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-600 font-semibold">للشركاء</span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/join-us"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  انضم كشريك (محل • مصنع • مندوب توصيل)
                </Link>
              </div>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  ← العودة للصفحة الرئيسية
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>محمي بتشفير SSL 🔒</p>
          <p className="mt-1">جميع الحقوق محفوظة © 2026 Eng/Akram elmasry</p>
        </div>
      </div>
    </div>
  );
}
