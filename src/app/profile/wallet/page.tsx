'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Coins, Gift, Calendar, ShoppingBag, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minPurchase: number;
  discountType: string;
  isActive: boolean;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
}

interface WalletData {
  coupons: Coupon[];
  totalBalance: number;
  availableCouponsCount: number;
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchWalletData();
    }
  }, [status, router]);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/user/coupons');
      if (response.ok) {
        const data = await response.json();
        setWalletData(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 text-gray-300 hover:text-white">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للملف الشخصي
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">محفظة الخصومات</h1>
          </div>
          <p className="text-gray-400">رصيدك من كوبونات الخصم المتاحة</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 border-none shadow-2xl">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-white/80 mb-2">إجمالي الرصيد المتاح</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-5xl font-black text-white drop-shadow-lg">
                  {walletData?.totalBalance.toFixed(0)}
                </span>
                <span className="text-2xl text-white/90">جنيه</span>
              </div>
              <div className="flex items-center justify-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span>{walletData?.availableCouponsCount} كوبون متاح</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-8 bg-gray-800/50 border-teal-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
              <div className="text-gray-300">
                <p className="font-semibold mb-2">كيفية استخدام الرصيد:</p>
                <ul className="space-y-1 text-sm">
                  <li>• استخدم الكوبونات عند إتمام الشراء للحصول على الخصم</li>
                  <li>• كل كوبون له حد أدنى للشراء لاستخدامه</li>
                  <li>• الكوبونات صالحة لفترة محدودة - استخدمها قبل انتهاء صلاحيتها</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coupons List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">الكوبونات المتاحة</h2>
          
          {walletData?.coupons && walletData.coupons.length > 0 ? (
            walletData.coupons.map((coupon) => {
              const remainingUses = coupon.maxUses - coupon.usedCount;
              const expiringSoon = isExpiringSoon(coupon.expiresAt);
              
              return (
                <Card key={coupon.id} className={`bg-gray-800/50 border-2 transition-all hover:scale-[1.02] ${
                  expiringSoon ? 'border-orange-500/50' : 'border-teal-500/20'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Coupon Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-3">
                            <Gift className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              خصم {coupon.discount} جنيه
                            </h3>
                            <p className="text-sm text-gray-400">كود: {coupon.code}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <ShoppingBag className="w-4 h-4 text-teal-400" />
                            <span>الحد الأدنى للشراء: {coupon.minPurchase} جنيه</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4 text-teal-400" />
                            <span>ينتهي في: {formatDate(coupon.expiresAt)}</span>
                            {expiringSoon && (
                              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded">
                                ينتهي قريباً!
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-teal-400" />
                            <span>متبقي {remainingUses} من {coupon.maxUses} استخدام</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex flex-col gap-2">
                        <Link href="/products">
                          <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white w-full">
                            تسوق الآن
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-gray-800/50 border-teal-500/20">
              <CardContent className="p-12 text-center">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">لا توجد كوبونات متاحة حالياً</p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                    ابدأ التسوق
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
