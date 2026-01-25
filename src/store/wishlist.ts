import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    nameAr: string;
    price: number;
    images: string | null;
    stock: number;
    category: {
      nameAr: string;
    };
  };
  notifyOnLowStock: boolean;
  createdAt: Date;
}

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  notifications: number;
  
  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string, notifyOnLowStock?: boolean) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchNotifications: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      notifications: 0,

      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const response = await fetch('/api/wishlist');
          if (response.ok) {
            const data = await response.json();
            set({ items: data, loading: false });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          set({ loading: false });
        }
      },

      addToWishlist: async (productId: string, notifyOnLowStock = true) => {
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, notifyOnLowStock }),
          });

          if (response.ok) {
            const newItem = await response.json();
            set((state) => ({
              items: [newItem, ...state.items],
            }));
            
            // Fetch notifications after adding
            get().fetchNotifications();
          } else {
            const error = await response.json();
            throw new Error(error.error || 'فشل في إضافة المنتج');
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          throw error;
        }
      },

      removeFromWishlist: async (productId: string) => {
        try {
          const response = await fetch(`/api/wishlist?productId=${productId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            set((state) => ({
              items: state.items.filter((item) => item.productId !== productId),
            }));
            
            // Update notifications
            get().fetchNotifications();
          } else {
            throw new Error('فشل في حذف المنتج');
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          throw error;
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      fetchNotifications: async () => {
        try {
          const response = await fetch('/api/wishlist/notifications');
          if (response.ok) {
            const data = await response.json();
            set({ notifications: data.count });
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      },

      clearWishlist: () => {
        set({ items: [], notifications: 0 });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
