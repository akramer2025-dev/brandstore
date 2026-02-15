import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
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
}

interface CartStore {
  items: CartItem[];
  userId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setUserId: (userId: string | null) => void;
  initializeCart: (userId: string | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      
      setUserId: (userId) => {
        const currentUserId = get().userId;
        
        // إذا تغير المستخدم، امسح السلة القديمة
        if (currentUserId !== userId) {
          set({ userId, items: [] });
        }
      },
      
      initializeCart: (userId) => {
        const currentUserId = get().userId;
        
        // إذا كان المستخدم مختلف عن المحفوظ، امسح السلة
        if (currentUserId !== userId) {
          set({ userId, items: [] });
        } else if (!currentUserId && userId) {
          // إذا كان المستخدم سجل دخول لأول مرة
          set({ userId });
        }
      },
      
      addItem: (item) => {
        const items = get().items;
        // البحث عن المنتج بنفس الـ id ونفس الـ variant (إن وجد)
        const existingItem = items.find((i) => {
          if (item.variant) {
            // إذا كان المنتج له variant، نتحقق من id المنتج و id الـ variant
            return i.id === item.id && i.variant?.id === item.variant.id;
          } else {
            // إذا لم يكن له variant، نتحقق من id المنتج فقط وأنه ليس له variant
            return i.id === item.id && !i.variant;
          }
        });
        
        if (existingItem) {
          set({
            items: items.map((i) => {
              // نفس المنطق في التحديث
              if (item.variant) {
                return i.id === item.id && i.variant?.id === item.variant.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i;
              } else {
                return i.id === item.id && !i.variant
                  ? { ...i, quantity: i.quantity + 1 }
                  : i;
              }
            }),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => set({ items: [] }),
      
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
