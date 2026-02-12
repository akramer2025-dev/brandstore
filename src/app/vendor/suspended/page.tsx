'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageCircle, Phone } from 'lucide-react';

export default function SuspendedAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'VENDOR') {
      checkSuspensionStatus();
    } else if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, session]);

  const checkSuspensionStatus = async () => {
    try {
      const res = await fetch('/api/vendor/suspension-status');
      const data = await res.json();
      
      if (!data.isSuspended) {
        // الحساب مش موقوف، روح للداشبورد
        router.push('/vendor/dashboard');
      } else {
        setVendorInfo(data);
      }
    } catch (error) {
      console.error('Error checking suspension status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const whatsapp = vendorInfo?.whatsapp || '01555512778';
    const message = encodeURIComponent(
      `مرحباً، أنا ${vendorInfo?.storeNameAr || 'شريك'} وأريد تفعيل حسابي`
    );
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <AlertCircle className="w-16 h-16" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {vendorInfo?.storeNameAr || 'متجرك'}
          </CardTitle>
          <p className="text-xl mt-2">يا أهلاً وسهلاً! 🌟</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {/* الرسالة الأساسية */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              حسابك موقوف مؤقتاً
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {vendorInfo?.suspensionReason || 
               'من فضلك تواصل معانا على الواتساب لتفعيل حسابك'}
            </p>
          </div>

          {/* معلومات الاتصال */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center text-gray-800">
              تواصل معانا الآن
            </h3>
            
            <div className="grid gap-4">
              <Button
                onClick={handleWhatsAppContact}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg py-6"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                تواصل على الواتساب
              </Button>

              {vendorInfo?.phone && (
                <Button
                  onClick={() => window.open(`tel:${vendorInfo.phone}`)}
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-purple-300 hover:bg-purple-50 text-lg py-6"
                >
                  <Phone className="w-6 h-6 mr-2" />
                  {vendorInfo.phone}
                </Button>
              )}
            </div>
          </div>

          {/* ملاحظة */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              💡 بمجرد التواصل معانا هنفعّل حسابك في أسرع وقت
            </p>
          </div>

          {/* زر الخروج */}
          <div className="pt-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
