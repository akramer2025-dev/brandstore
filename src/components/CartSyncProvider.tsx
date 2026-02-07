'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';

export default function CartSyncProvider() {
  const { data: session, status } = useSession();
  const { initializeCart } = useCartStore();

  useEffect(() => {
    if (status === 'loading') return;

    // ربط السلة بالمستخدم الحالي أو null للزوار
    const userId = session?.user?.id || null;
    initializeCart(userId);
  }, [session, status, initializeCart]);

  return null;
}
