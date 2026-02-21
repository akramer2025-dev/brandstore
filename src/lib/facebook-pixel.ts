/**
 * Facebook Pixel Helper Functions
 * 
 * هذه الدوال تساعد في تتبع أحداث Pixel بسهولة
 */

// Type definitions
interface FBProduct {
  id: string;
  name?: string;
  price: number;
  quantity?: number;
}

interface FBPixelEvent {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  value?: number;
  currency?: string;
  contents?: Array<{ id: string; quantity: number }>;
  num_items?: number;
}

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: FBPixelEvent
    ) => void;
  }
}

/**
 * تتبع مشاهدة منتج (ViewContent)
 */
export const trackViewContent = (product: FBProduct) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name || '',
      content_type: 'product',
      value: product.price,
      currency: 'EGP',
    });
    console.log('✅ Facebook Pixel: ViewContent tracked', product.id);
  } catch (error) {
    console.error('❌ Facebook Pixel ViewContent Error:', error);
  }
};

/**
 * تتبع إضافة منتج للسلة (AddToCart)
 */
export const trackAddToCart = (product: FBProduct, quantity: number = 1) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name || '',
      content_type: 'product',
      value: product.price * quantity,
      currency: 'EGP',
      contents: [{ id: product.id, quantity }],
      num_items: quantity,
    });
    console.log('✅ Facebook Pixel: AddToCart tracked', product.id, 'x', quantity);
  } catch (error) {
    console.error('❌ Facebook Pixel AddToCart Error:', error);
  }
};

/**
 * تتبع بدء عملية الشراء (InitiateCheckout)
 */
export const trackInitiateCheckout = (products: FBProduct[], total: number) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: products.map(p => p.id),
      content_type: 'product',
      value: total,
      currency: 'EGP',
      contents: products.map(p => ({ 
        id: p.id, 
        quantity: p.quantity || 1 
      })),
      num_items: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
    });
    console.log('✅ Facebook Pixel: InitiateCheckout tracked', total);
  } catch (error) {
    console.error('❌ Facebook Pixel InitiateCheckout Error:', error);
  }
};

/**
 * تتبع عملية شراء مكتملة (Purchase)
 */
export const trackPurchase = (products: FBProduct[], total: number, orderId?: string) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', 'Purchase', {
      content_ids: products.map(p => p.id),
      content_type: 'product',
      value: total,
      currency: 'EGP',
      contents: products.map(p => ({ 
        id: p.id, 
        quantity: p.quantity || 1 
      })),
      num_items: products.reduce((sum, p) => sum + (p.quantity || 1), 0),
    });
    console.log('✅ Facebook Pixel: Purchase tracked', total, orderId);
  } catch (error) {
    console.error('❌ Facebook Pixel Purchase Error:', error);
  }
};

/**
 * تتبع البحث (Search)
 */
export const trackSearch = (searchString: string) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', 'Search', {
      content_type: 'product',
    });
    console.log('✅ Facebook Pixel: Search tracked', searchString);
  } catch (error) {
    console.error('❌ Facebook Pixel Search Error:', error);
  }
};

/**
 * تتبع إضافة منتج لقائمة الأمنيات (AddToWishlist)
 */
export const trackAddToWishlist = (product: FBProduct) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', 'AddToWishlist', {
      content_ids: [product.id],
      content_name: product.name || '',
      content_type: 'product',
      value: product.price,
      currency: 'EGP',
    });
    console.log('✅ Facebook Pixel: AddToWishlist tracked', product.id);
  } catch (error) {
    console.error('❌ Facebook Pixel AddToWishlist Error:', error);
  }
};

/**
 * Custom Event (للأحداث المخصصة)
 */
export const trackCustomEvent = (eventName: string, params?: FBPixelEvent) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('trackCustom', eventName, params);
    console.log('✅ Facebook Pixel: Custom event tracked', eventName);
  } catch (error) {
    console.error('❌ Facebook Pixel Custom Event Error:', error);
  }
};
