'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';

export default function CartSyncProvider() {
  const { data: session, status } = useSession();
  const { initializeCart, syncWithServer } = useCartStore();

  useEffect(() => {
    if (status === 'loading') return;

    // ربط السلة بالمستخدم الحالي أو null للزوار
    const userId = session?.user?.id || null;
    
    // تهيئة السلة ومزامنة مع السيرفر
    initializeCart(userId);
    
    // مزامنة دورية كل 30 ثانية (في حالة وجود تغييرات من أجهزة أخرى)
    let syncInterval: NodeJS.Timeout | null = null;
    
    if (userId) {
      syncInterval = setInterval(() => {
        syncWithServer();
      }, 30000); // كل 30 ثانية
    }
    
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [session, status, initializeCart, syncWithServer]);

  return null;
}
