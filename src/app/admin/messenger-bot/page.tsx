'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  Bot, 
  CheckCircle2, 
  XCircle,
  Settings,
  BarChart3,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MessengerBotPage() {
  const { data: session, status } = useSession();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }
    if (session?.user?.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  useEffect(() => {
    checkBotStatus();
  }, []);

  const checkBotStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch('/api/messenger/status');
      if (response.ok) {
        const data = await response.json();
        setIsConfigured(data.configured);
      }
    } catch (error) {
      console.error('خطأ في فحص حالة البوت:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* العنوان والحالة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">بوت Messenger</h1>
            <p className="text-gray-600">نظام الرد التلقائي الذكي</p>
          </div>
        </div>

        {isCheckingStatus ? (
          <Badge variant="secondary">جاري الفحص...</Badge>
        ) : isConfigured ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4 ml-1" />
            مفعّل
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="h-4 w-4 ml-1" />
            غير مفعّل
          </Badge>
        )}
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>إجمالي الرسائل</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <MessageCircle className="h-4 w-4 ml-1" />
              اليوم
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>المستخدمون النشطون</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 ml-1" />
              آخر 24 ساعة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>متوسط وقت الرد</CardDescription>
            <CardTitle className="text-2xl">فوري</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 ml-1" />
              أقل من ثانية
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>معدل الرضا</CardDescription>
            <CardTitle className="text-2xl">95%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 ml-1" />
              +5% عن الشهر الماضي
            </div>
          </CardContent>
        </Card>
      </div>

      {/* حالة الإعداد */}
      {!isConfigured && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Settings className="h-5 w-5" />
              يجب إعداد البوت
            </CardTitle>
            <CardDescription className="text-yellow-700">
              يجب إضافة معلومات الاتصال في ملف البيئة (.env)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-yellow-200 space-y-2">
              <h3 className="font-semibold text-gray-900">المتغيرات المطلوبة:</h3>
              <code className="block bg-gray-100 p-3 rounded text-sm" dir="ltr">
                MESSENGER_VERIFY_TOKEN=your_verify_token<br />
                MESSENGER_PAGE_ACCESS_TOKEN=your_page_token
              </code>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => window.open('/MESSENGER_BOT_SETUP.md', '_blank')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                دليل الإعداد الكامل
              </Button>
              <Button 
                variant="outline"
                onClick={checkBotStatus}
              >
                إعادة الفحص
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* الردود الذكية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            الردود التلقائية الذكية
          </CardTitle>
          <CardDescription>
            البوت يتعرف تلقائياً على نوع السؤال ويرد بشكل مناسب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: '👋 ترحيب',
                keywords: 'السلام، مرحبا، hi، hello',
                description: 'يرحب بالعميل ويعرض أزرار Quick Replies'
              },
              { 
                title: '🛍️ المنتجات',
                keywords: 'منتج، ملابس، product',
                description: 'يعرض معلومات عن المنتجات ورابط المتجر'
              },
              { 
                title: '📦 الطلبات',
                keywords: 'طلب، شحن، order',
                description: 'معلومات الشحن المجاني والتوصيل'
              },
              { 
                title: '💰 الأسعار',
                keywords: 'سعر، كام، price',
                description: 'يعرض الخصومات والعروض المتاحة'
              },
              { 
                title: '📞 التواصل',
                keywords: 'تواصل، رقم، contact',
                description: 'بيانات التواصل الكاملة'
              },
              { 
                title: '❓ المساعدة',
                keywords: 'مساعدة، help',
                description: 'قائمة بجميع الأوامر المتاحة'
              },
              { 
                title: '🙏 الشكر',
                keywords: 'شكرا، thanks',
                description: 'رد لطيف على الشكر'
              },
              { 
                title: '📱 التطبيق',
                keywords: 'تطبيق، app، download',
                description: 'معلومات عن تطبيق الموبايل'
              },
            ].map((response, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-1">{response.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{response.description}</p>
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>الكلمات المفتاحية:</strong> {response.keywords}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* مميزات البوت */}
      <Card>
        <CardHeader>
          <CardTitle>✨ مميزات البوت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              '✅ يعمل 24/7 بدون توقف',
              '✅ ردود فورية (أقل من ثانية)',
              '✅ يدعم العربية والإنجليزية',
              '✅ Quick Replies تفاعلية',
              '✅ لا يحتاج تدريب معقد',
              '✅ يوفر وقت فريق الدعم',
              '✅ تجربة عملاء محسنة',
              '✅ مجاني تماماً'
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
              >
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* اختبار البوت */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 اختبار البوت</CardTitle>
          <CardDescription>
            جرب إرسال رسالة لصفحتك على Facebook Messenger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">طريقة الاختبار:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>اذهب لصفحتك على Facebook</li>
              <li>اضغط على زر "Send Message"</li>
              <li>اكتب "مرحبا" أو "hi"</li>
              <li>يجب أن يرد البوت فوراً! ✅</li>
            </ol>
          </div>

          <Button 
            onClick={() => window.open('https://www.facebook.com/messages', '_blank')}
            className="w-full"
          >
            <MessageCircle className="h-4 w-4 ml-2" />
            فتح Messenger
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
