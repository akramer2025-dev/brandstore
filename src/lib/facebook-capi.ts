// Facebook Conversions API Integration
// هذا الملف يرسل events من السيرفر لـ Facebook مباشرة

interface FacebookEvent {
  event_name: string;
  event_time: number;
  user_data: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string; // Facebook browser pixel cookie
    fbc?: string; // Facebook click ID
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
  };
  event_source_url?: string;
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat';
}

export class FacebookConversionsAPI {
  private pixelId: string;
  private accessToken: string;
  private testEventCode?: string;

  constructor() {
    this.pixelId = process.env.FACEBOOK_PIXEL_ID || '';
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
    this.testEventCode = process.env.FACEBOOK_TEST_EVENT_CODE; // للتجربة
  }

  /**
   * Hash email or phone for privacy
   */
  private hash(value: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
  }

  /**
   * Track event to Facebook
   */
  async trackEvent(event: FacebookEvent): Promise<boolean> {
    if (!this.pixelId || !this.accessToken) {
      console.error('❌ Facebook Pixel ID or Access Token missing');
      return false;
    }

    try {
      const url = `https://graph.facebook.com/v21.0/${this.pixelId}/events`;
      
      const payload = {
        data: [event],
        access_token: this.accessToken,
        ...(this.testEventCode && { test_event_code: this.testEventCode }),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Facebook CAPI Error:', result);
        return false;
      }

      console.log('✅ Event sent to Facebook:', event.event_name);
      return true;

    } catch (error: any) {
      console.error('❌ Error sending event:', error.message);
      return false;
    }
  }

  /**
   * Track PageView
   */
  async trackPageView(data: {
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
    url: string;
    fbp?: string;
    fbc?: string;
  }) {
    return this.trackEvent({
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: data.url,
      action_source: 'website',
      user_data: {
        em: data.email ? this.hash(data.email) : undefined,
        ph: data.phone ? this.hash(data.phone) : undefined,
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        fbp: data.fbp,
        fbc: data.fbc,
      },
    });
  }

  /**
   * Track ViewContent (Product Page)
   */
  async trackViewContent(data: {
    productId: string;
    productName: string;
    price: number;
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
    url: string;
    fbp?: string;
    fbc?: string;
  }) {
    return this.trackEvent({
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: data.url,
      action_source: 'website',
      user_data: {
        em: data.email ? this.hash(data.email) : undefined,
        ph: data.phone ? this.hash(data.phone) : undefined,
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        fbp: data.fbp,
        fbc: data.fbc,
      },
      custom_data: {
        content_ids: [data.productId],
        content_type: 'product',
        value: data.price,
        currency: 'EGP',
      },
    });
  }

  /**
   * Track AddToCart
   */
  async trackAddToCart(data: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
    url: string;
    fbp?: string;
    fbc?: string;
  }) {
    return this.trackEvent({
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: data.url,
      action_source: 'website',
      user_data: {
        em: data.email ? this.hash(data.email) : undefined,
        ph: data.phone ? this.hash(data.phone) : undefined,
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        fbp: data.fbp,
        fbc: data.fbc,
      },
      custom_data: {
        content_ids: [data.productId],
        content_type: 'product',
        value: data.price * data.quantity,
        currency: 'EGP',
        num_items: data.quantity,
      },
    });
  }

  /**
   * Track InitiateCheckout
   */
  async trackInitiateCheckout(data: {
    productIds: string[];
    totalValue: number;
    numItems: number;
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
    url: string;
    fbp?: string;
    fbc?: string;
  }) {
    return this.trackEvent({
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: data.url,
      action_source: 'website',
      user_data: {
        em: data.email ? this.hash(data.email) : undefined,
        ph: data.phone ? this.hash(data.phone) : undefined,
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        fbp: data.fbp,
        fbc: data.fbc,
      },
      custom_data: {
        content_ids: data.productIds,
        content_type: 'product',
        value: data.totalValue,
        currency: 'EGP',
        num_items: data.numItems,
      },
    });
  }

  /**
   * Track Purchase (أهم event!)
   */
  async trackPurchase(data: {
    orderId: string;
    productIds: string[];
    totalValue: number;
    numItems: number;
    email?: string;
    phone: string;
    ip?: string;
    userAgent?: string;
    url: string;
    fbp?: string;
    fbc?: string;
  }) {
    return this.trackEvent({
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: data.url,
      action_source: 'website',
      user_data: {
        em: data.email ? this.hash(data.email) : undefined,
        ph: this.hash(data.phone), // دائماً متوفر في طلبك
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        fbp: data.fbp,
        fbc: data.fbc,
      },
      custom_data: {
        content_ids: data.productIds,
        content_type: 'product',
        value: data.totalValue,
        currency: 'EGP',
        num_items: data.numItems,
      },
    });
  }

  /**
   * Track Lead (form submission)
   */
  async trackLead(data: {
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
    url: string;
    fbp?: string;
    fbc?: string;
  }) {
    return this.trackEvent({
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: data.url,
      action_source: 'website',
      user_data: {
        em: data.email ? this.hash(data.email) : undefined,
        ph: data.phone ? this.hash(data.phone) : undefined,
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        fbp: data.fbp,
        fbc: data.fbc,
      },
    });
  }
}

// Singleton instance
export const fbCAPI = new FacebookConversionsAPI();
