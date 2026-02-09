'use client';

import { useState, useEffect, useCallback } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

interface SliderImage {
  id: string;
  titleAr: string;
  subtitleAr: string | null;
  imageUrl: string;
  isActive: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Slider state
  const [slides, setSlides] = useState<SliderImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // جلب صور السلايدر
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/admin/slider');
        if (res.ok) {
          const data = await res.json();
          const activeSlides = (data.sliderImages || data || []).filter((s: SliderImage) => s.isActive);
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      } catch (err) {
        console.log('Could not fetch slider images');
      }
    };
    fetchSlides();
  }, []);

  // تحريك السلايدر تلقائياً مع تأثير Ken Burns
  const advanceSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setIsTransitioning(true);
    const next = (currentSlide + 1) % slides.length;
    setNextSlide(next);
    
    setTimeout(() => {
      setCurrentSlide(next);
      setIsTransitioning(false);
    }, 1500); // مدة الانتقال
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(advanceSlide, 6000);
    return () => clearInterval(interval);
  }, [advanceSlide, slides.length]);

  // إذا المستخدم مسجل دخول، توجيهه للصفحة المناسبة حسب دوره
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('✅ User is already logged in, redirecting based on role:', session.user.role);
      
      if (session.user.role === 'ADMIN') {
        router.replace('/admin');
      } else if (session.user.role === 'VENDOR') {
        router.replace('/vendor/dashboard');
      } else if (session.user.role === 'MANUFACTURER') {
        router.replace('/manufacturer/dashboard');
      } else if (session.user.role === 'DELIVERY_STAFF') {
        router.replace('/delivery-dashboard');
      } else if (session.user.role === 'MARKETING_STAFF') {
        router.replace('/marketing/dashboard');
      } else if (session.user.role === 'CUSTOMER') {
        router.replace('/');
      } else {
        router.replace('/');
      }
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: true
      });
      
      if (result?.error) {
        setError(`حدث خطأ: ${result.error}`);
        setGoogleLoading(false);
      }
    } catch (error: any) {
      setError(error?.message || 'حدث خطأ في تسجيل الدخول بواسطة Google');
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
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (sessionData?.user?.role === 'ADMIN') {
          router.replace('/admin');
        } else if (sessionData?.user?.role === 'VENDOR') {
          router.replace('/vendor/dashboard');
        } else if (sessionData?.user?.role === 'MANUFACTURER') {
          router.replace('/manufacturer/dashboard');
        } else if (sessionData?.user?.role === 'DELIVERY_STAFF') {
          router.replace('/delivery-dashboard');
        } else if (sessionData?.user?.role === 'CUSTOMER') {
          router.replace('/customer');
        } else {
          router.replace('/');
        }
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-lg">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  // إذا المستخدم مسجل بالفعل
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-lg">تم تسجيل الدخول بنجاح! جاري التوجيه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden" dir="rtl">
      
      {/* ============ الخلفية المتحركة - السلايدر ============ */}
      <div className="absolute inset-0 z-0">
        {slides.length > 0 ? (
          <>
            {/* الصورة الحالية */}
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="absolute inset-0 transition-all duration-[1500ms] ease-in-out"
                style={{
                  opacity: index === currentSlide ? 1 : (isTransitioning && index === nextSlide ? 1 : 0),
                  zIndex: index === currentSlide ? 1 : (isTransitioning && index === nextSlide ? 2 : 0),
                }}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.titleAr || 'Slider'}
                  fill
                  sizes="100vw"
                  className={`object-cover transition-transform duration-[8000ms] ease-out ${
                    index === currentSlide ? 'scale-110' : 'scale-100'
                  }`}
                  priority={index === 0}
                />
              </div>
            ))}

            {/* نص السلايدر المتحرك - يظهر فقط على الشاشات الكبيرة */}
            <div className="absolute bottom-12 right-12 z-10 hidden lg:block max-w-md">
              <div className="transition-all duration-700 ease-out">
                {slides[currentSlide] && (
                  <div key={slides[currentSlide].id} className="animate-fade-in-up">
                    <h2 className="text-3xl xl:text-4xl font-black text-white mb-3 drop-shadow-2xl leading-tight">
                      {slides[currentSlide].titleAr}
                    </h2>
                    {slides[currentSlide].subtitleAr && (
                      <p className="text-lg text-gray-200 drop-shadow-lg">
                        {slides[currentSlide].subtitleAr}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* مؤشرات السلايدر */}
            <div className="absolute bottom-6 right-1/2 translate-x-1/2 lg:right-12 lg:translate-x-0 z-10 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setNextSlide(index);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsTransitioning(false);
                    }, 1500);
                  }}
                  className={`transition-all duration-500 rounded-full ${
                    index === currentSlide
                      ? 'w-8 h-3 bg-white shadow-lg shadow-white/30'
                      : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          /* خلفية بديلة متحركة في حالة عدم وجود صور */
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
          </div>
        )}

        {/* طبقة التعتيم الاحترافية */}
        <div className="absolute inset-0 z-[3]" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.6) 100%)'
        }}></div>
        
        {/* نمط شبكي خفيف */}
        <div className="absolute inset-0 z-[4] opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* ============ محتوى الصفحة ============ */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        
        <div className="w-full max-w-[420px] my-auto">
          
          {/* اللوجو والبراند - متكامل مع الكارت */}
          <div className="text-center mb-5">
            <Link href="/" className="inline-block group">
              <div className="flex flex-col items-center gap-2.5">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse"></div>
                  <div className="relative bg-white/15 backdrop-blur-md rounded-full p-2 ring-2 ring-white/25 shadow-2xl shadow-purple-500/20">
                    <img 
                      src="/logo.png" 
                      alt="Remo Store" 
                      className="w-[72px] h-[72px] rounded-full object-contain transform transition-all duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-black text-white drop-shadow-2xl tracking-wide">
                    ريمو ستور
                  </h1>
                  <p className="text-xs text-gray-300/90 font-medium flex items-center gap-1.5 justify-center mt-0.5">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    تسوق بذكاء وثقة
                    <Sparkles className="w-3 h-3 text-purple-400" />
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* كارت تسجيل الدخول */}
          <div className="relative rounded-2xl overflow-hidden">
            {/* توهج علوي */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent z-10"></div>
            
            <Card className="border border-white/[0.12] shadow-2xl bg-black/40 backdrop-blur-xl rounded-2xl">
              <CardHeader className="pb-4 pt-6 px-6 border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white mb-1">
                      تسجيل الدخول
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400">
                      العملاء • الإدارة • الشركاء • التوصيل
                    </CardDescription>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2.5 rounded-xl border border-white/[0.08]">
                    <ShoppingBag className="w-5 h-5 text-purple-300" />
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit} suppressHydrationWarning>
                <CardContent className="space-y-4 pt-5 px-6">
                  {error && (
                    <div className="bg-red-500/15 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* حقل البريد الإلكتروني */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-300">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative group/input">
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 text-base bg-white/[0.06] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-purple-400/60 focus:bg-white/[0.1] focus:ring-1 focus:ring-purple-400/20 transition-all duration-300 rounded-xl"
                        disabled={loading}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within/input:from-purple-500/5 group-focus-within/input:via-purple-500/5 group-focus-within/input:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* حقل كلمة المرور */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-300">
                      كلمة المرور
                    </Label>
                    <div className="relative group/input">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-base bg-white/[0.06] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-purple-400/60 focus:bg-white/[0.1] focus:ring-1 focus:ring-purple-400/20 transition-all duration-300 pl-12 rounded-xl"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-300 transition-colors duration-200"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-[18px] h-[18px]" />
                        ) : (
                          <Eye className="w-[18px] h-[18px]" />
                        )}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within/input:from-purple-500/5 group-focus-within/input:via-purple-500/5 group-focus-within/input:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* تذكرني ونسيت كلمة المرور */}
                  <div className="flex items-center justify-between text-sm pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
                      <input type="checkbox" className="rounded-[4px] border-white/20 bg-white/[0.06] text-purple-500 focus:ring-purple-400/30 w-4 h-4" />
                      <span className="text-xs">تذكرني</span>
                    </label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-3 pb-6 px-6">
                  {/* زر تسجيل الدخول */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-white border-0 rounded-xl"
                    disabled={loading || googleLoading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-[18px] h-[18px] ml-2" />
                        تسجيل الدخول
                      </>
                    )}
                  </Button>

                  {/* فاصل */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs text-gray-500 bg-[rgba(0,0,0,0.4)]">أو</span>
                    </div>
                  </div>

                  {/* زر Google */}
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    className="w-full h-11 text-sm font-semibold bg-white hover:bg-gray-100 text-gray-700 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg rounded-xl"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <FcGoogle className="w-5 h-5 ml-2" />
                        تسجيل الدخول بواسطة Google
                      </>
                    )}
                  </Button>

                  {/* تسجيل حساب جديد */}
                  <p className="text-center text-xs text-gray-400 mt-1">
                    ليس لديك حساب؟{' '}
                    <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors underline underline-offset-2">
                      سجل كعميل
                    </Link>
                  </p>
                  
                  {/* فاصل الشركاء */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs text-gray-500 bg-[rgba(0,0,0,0.4)]">للشركاء</span>
                    </div>
                  </div>

                  {/* زر انضم كشريك */}
                  <Link
                    href="/auth/join-us"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white rounded-xl font-bold text-sm border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    انضم كشريك (محل • مصنع • مندوب توصيل)
                  </Link>

                  {/* رجوع */}
                  <Link
                    href="/"
                    className="text-xs text-gray-500 hover:text-gray-300 font-medium flex items-center justify-center gap-1 transition-colors mt-1"
                  >
                    ← العودة للصفحة الرئيسية
                  </Link>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-5 flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] backdrop-blur-sm rounded-full border border-white/[0.08]">
              <span className="text-xs font-medium text-gray-400">🔒 محمي بتشفير SSL</span>
            </div>
            <p className="text-xs text-gray-500">© 2026 Remostore</p>
          </div>
        </div>
      </div>

    </div>
  );
}
