import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId?: string; // للتوافق مع الكود القديم
  name: string;
  nameAr?: string;
  price: number;
  originalPrice?: number; // السعر الوهمي (قبل الخصم المزيف)
  quantity: number;
  image?: string;
  categoryName?: string;
  variant?: {
    id: string;
    nameAr: string;
    price: number;
  };
  stock?: number;
  isActive?: boolean;
}

interface CartStore {
  items: CartItem[];
  userId: string | null;
  isLoading: boolean;
  isSyncing: boolean; // للدلالة على جاري المزامنة
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setUserId: (userId: string | null) => void;
  initializeCart: (userId: string | null) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      isLoading: false,
      isSyncing: false,
      
      setUserId: (userId) => {
        const currentUserId = get().userId;
        
        // إذا تغير المستخدم، امسح السلة المحلية وجلب من السيرفر
        if (currentUserId !== userId) {
          set({ userId, items: [] });
          if (userId) {
            get().syncWithServer();
          }
        }
      },
      
      initializeCart: async (userId) => {
        const currentUserId = get().userId;
        
        // إذا كان المستخدم مختلف، امسح وجلب من السيرفر
        if (currentUserId !== userId) {
          set({ userId, items: [] });
          if (userId) {
            await get().syncWithServer();
          }
        } else if (userId && get().items.length === 0) {
          // إذا السلة فاضية، جلب من السيرفر
          await get().syncWithServer();
        }
      },
      
      // 🔄 المزامنة مع السيرفر
      syncWithServer: async () => {
        const userId = get().userId;
        if (!userId) {
          console.log('⚠️ [CART SYNC] لا يوجد مستخدم - تخطي المزامنة');
          return;
        }
        
        // ⚠️ TEMPORARY: Disable server sync until Cart table is deployed on Vercel
        // Silent mode - cart works locally
        return;
        
        try {
          set({ isSyncing: true });
          console.log('🔄 [CART SYNC] بدء المزامنة للمستخدم:', userId);
          
          const response = await fetch('/api/cart');
          
          console.log('📡 [CART SYNC] Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.items) {
              set({ items: data.items });
              console.log('✅ [CART SYNC] تمت المزامنة:', data.items.length, 'منتج');
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ [CART SYNC] فشل:', response.status, errorData);
          }
        } catch (error) {
          console.error('❌ [CART SYNC] خطأ:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
      
      // ➕ إضافة منتج
      addItem: async (item) => {
        const userId = get().userId;
        
        // إضافة محلية أولاً للسرعة
        const items = get().items;
        const existingItem = items.find((i) => {
          if (item.variant) {
            return (i.productId || i.id) === (item.productId || item.id) && i.variant?.id === item.variant.id;
          } else {
            return (i.productId || i.id) === (item.productId || item.id) && !i.variant;
          }
        });
        
        if (existingItem) {
          set({
            items: items.map((i) => {
              if (item.variant) {
                return (i.productId || i.id) === (item.productId || item.id) && i.variant?.id === item.variant.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i;
              } else {
                return (i.productId || i.id) === (item.productId || item.id) && !i.variant
                  ? { ...i, quantity: i.quantity + 1 }
                  : i;
              }
            }),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
        
        // المزامنة مع السيرفر
        if (userId) {
          try {
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: item.productId || item.id,
                variantId: item.variant?.id,
                price: item.price,
                quantity: 1
              })
            });
            
            if (response.ok) {
              // تحديث السلة بالبيانات من السيرفر
              await get().syncWithServer();
            }
          } catch (error) {
            console.error('❌ [CART] فشل حفظ في السيرفر:', error);
          }
        }
      },
      
      // 🗑️ حذف منتج
      removeItem: async (id) => {
        // حذف محلي أولاً
        set({ items: get().items.filter((item) => item.id !== id) });
        
        // المزامنة مع السيرفر
        const userId = get().userId;
        if (userId) {
          try {
            await fetch(`/api/cart/${id}`, { method: 'DELETE' });
          } catch (error) {
            console.error('❌ [CART] فشل الحذف من السيرفر:', error);
          }
        }
      },
      
      // ✏️ تعديل الكمية
      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }
        
        // تعديل محلي أولاً
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
        
        // المزامنة مع السيرفر
        const userId = get().userId;
        if (userId) {
          try {
            await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cartItemId: id, quantity })
            });
          } catch (error) {
            console.error('❌ [CART] فشل تعديل الكمية في السيرفر:', error);
          }
        }
      },
      
      // 🧹 مسح السلة
      clearCart: async () => {
        set({ items: [] });
        
        const userId = get().userId;
        if (userId) {
          try {
            await fetch('/api/cart', { method: 'DELETE' });
          } catch (error) {
            console.error('❌ [CART] فشل مسح السلة من السيرفر:', error);
          }
        }
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
