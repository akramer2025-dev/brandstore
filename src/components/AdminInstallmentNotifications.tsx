// نظام الإشعارات Real-time للمدير
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface NewInstallmentRequest {
  id: string;
  agreementNumber: string;
  fullName: string;
  totalAmount: number;
  createdAt: string;
}

export function AdminInstallmentNotifications() {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [newRequests, setNewRequests] = useState<NewInstallmentRequest[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // صوت التنبيه
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/notification.mp3'); // تأكد من وجود الملف!
    audio.volume = 0.5;
    audio.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
  }, []);

  // جلب الطلبات الجديدة
  const checkNewRequests = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/installments/pending?since=${lastCheck.toISOString()}`);
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.newRequests && data.newRequests.length > 0) {
        // 🔔 طلبات جديدة!
        setNewRequests(data.newRequests);
        setPendingCount(prev => prev + data.newRequests.length);
        
        // تشغيل الصوت والإشعار
        playNotificationSound();
        
        toast.success(`🔔 ${data.newRequests.length} طلب تقسيط جديد!`, {
          description: `من ${data.newRequests[0].fullName}`,
          action: {
            label: 'عرض',
            onClick: () => {
              window.location.href = '/admin/installments';
            },
          },
          duration: 10000,
        });
        
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error);
    }
  }, [lastCheck, playNotificationSound]);

  // فحص دوري كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(checkNewRequests, 30000);
    return () => clearInterval(interval);
  }, [checkNewRequests]);

  // جلب العدد الأولي
  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const response = await fetch('/api/admin/installments?status=PENDING&limit=1');
        const data = await response.json();
        
        if (data.success && data.pagination) {
          setPendingCount(data.pagination.total);
        }
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
      }
    };
    
    fetchInitialCount();
  }, []);

  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setShowNotificationPanel(!showNotificationPanel)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl"
          size="icon"
        >
          <Bell className="w-6 h-6 animate-pulse" />
          {pendingCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white font-bold animate-bounce">
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          )}
        </Button>

        {/* لوحة الإشعارات */}
        {showNotificationPanel && (
          <Card className="absolute bottom-16 left-0 w-96 shadow-2xl border-purple-500/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-lg">🔔 طلبات جديدة</h3>
                <Badge variant="destructive" className="animate-pulse">
                  {pendingCount}
                </Badge>
              </div>

              {newRequests.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {newRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-purple-900">{req.fullName}</p>
                          <p className="text-xs text-gray-600">{req.agreementNumber}</p>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          {req.totalAmount.toLocaleString()} ج.م
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(req.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>لا توجد طلبات جديدة الآن</p>
                </div>
              )}

              <Button
                onClick={() => {
                  window.location.href = '/admin/installments?status=PENDING';
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Check className="w-4 h-4 mr-2" />
                مراجعة جميع الطلبات
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
