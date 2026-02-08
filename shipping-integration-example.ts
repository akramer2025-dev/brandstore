// 📦 مثال عملي: Integration Service لشركة الشحن
// يمكن تعديل هذا الكود حسب API الخاص بشركة الشحن

import { prisma } from './prisma';

interface ShipmentData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  governorate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  cashOnDelivery: number;
  deliveryFee: number;
}

interface ShippingCompanyResponse {
  shipmentId: string;
  trackingUrl: string;
  status: string;
  createdAt: string;
}

export class ShippingService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // ضع API Key و Base URL الخاص بشركة الشحن
    this.apiKey = process.env.SHIPPING_API_KEY || '';
    this.apiUrl = process.env.SHIPPING_API_URL || '';
  }

  /**
   * إنشاء شحنة جديدة
   * Create new shipment with shipping company
   */
  async createShipment(data: ShipmentData): Promise<ShippingCompanyResponse> {
    try {
      // 1. تحضير البيانات حسب format شركة الشحن
      const payload = this.formatShipmentData(data);

      // 2. إرسال الطلب لشركة الشحن
      const response = await fetch(`${this.apiUrl}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          // أو حسب authentication method الخاص بهم:
          // 'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Shipping API Error: ${response.statusText}`);
      }

      const result = await response.json();

      // 3. تحديث الطلب في قاعدة البيانات
      await this.updateOrderWithShipment(data.orderId, result);

      return {
        shipmentId: result.shipment_id || result.id,
        trackingUrl: result.tracking_url,
        status: result.status,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }

  /**
   * تتبع الشحنة
   * Track shipment status
   */
  async trackShipment(shipmentId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/shipments/${shipmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Tracking API Error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  }

  /**
   * إلغاء الشحنة
   * Cancel shipment
   */
  async cancelShipment(shipmentId: string, reason: string) {
    try {
      const response = await fetch(
        `${this.apiUrl}/shipments/${shipmentId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error(`Cancel API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling shipment:', error);
      throw error;
    }
  }

  /**
   * حساب تكلفة الشحن
   * Calculate delivery fee
   */
  async calculateDeliveryFee(
    governorate: string,
    weight?: number
  ): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}/delivery-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          governorate,
          weight: weight || 1, // default weight
        }),
      });

      if (!response.ok) {
        throw new Error(`Delivery Fee API Error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.delivery_fee || result.fee || 0;
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      // Return default fee if API fails
      return 50;
    }
  }

  /**
   * تحويل بيانات الطلب لصيغة شركة الشحن
   * Format order data to shipping company format
   */
  private formatShipmentData(data: ShipmentData) {
    // ⚠️ هذا مثال - عدل حسب API شركة الشحن
    return {
      // Merchant/Store Info
      merchant_id: process.env.MERCHANT_ID,
      
      // Customer Info
      customer: {
        name: data.customerName,
        phone: data.customerPhone,
        address: data.deliveryAddress,
        city: data.governorate,
      },

      // Order Info
      order: {
        reference_id: data.orderId,
        items: data.items,
        cash_on_delivery: data.cashOnDelivery,
        delivery_fee: data.deliveryFee,
      },

      // Delivery Info
      delivery: {
        type: 'home_delivery',
        notes: 'فحص المنتج قبل الدفع',
      },
    };
  }

  /**
   * تحديث بيانات الطلب في قاعدة البيانات
   * Update order in database with shipment info
   */
  private async updateOrderWithShipment(
    orderId: string,
    shipmentData: any
  ) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        // تخزين بيانات الشحنة
        bustaShipmentId: shipmentData.shipment_id || shipmentData.id,
        bustaTrackingUrl: shipmentData.tracking_url,
        bustaStatus: shipmentData.status,
        bustaSentAt: new Date(),
        // تحديث حالة الطلب
        status: 'SHIPPED',
      },
    });
  }

  /**
   * معالجة Webhook من شركة الشحن
   * Handle webhook from shipping company
   */
  async handleWebhook(webhookData: any) {
    try {
      // التحقق من صحة الـ Webhook (إن وجد signature)
      // this.verifyWebhookSignature(webhookData);

      const { shipment_id, status, tracking_url } = webhookData;

      // البحث عن الطلب
      const order = await prisma.order.findFirst({
        where: { bustaShipmentId: shipment_id },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // تحديث حالة الطلب
      await prisma.order.update({
        where: { id: order.id },
        data: {
          bustaStatus: status,
          bustaTrackingUrl: tracking_url,
          // تحديث status بناءً على حالة الشحنة
          status: this.mapShippingStatusToOrderStatus(status),
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * تحويل حالة الشحنة لحالة الطلب
   * Map shipping status to order status
   */
  private mapShippingStatusToOrderStatus(shippingStatus: string) {
    const statusMap: Record<string, string> = {
      'created': 'CONFIRMED',
      'picked_up': 'SHIPPED',
      'in_transit': 'SHIPPED',
      'out_for_delivery': 'SHIPPED',
      'delivered': 'DELIVERED',
      'failed': 'CANCELLED',
      'returned': 'CANCELLED',
    };

    return statusMap[shippingStatus.toLowerCase()] || 'PENDING';
  }

  /**
   * التحقق من صحة Webhook Signature
   * Verify webhook signature (if required)
   */
  private verifyWebhookSignature(data: any, signature?: string): boolean {
    // Implement signature verification based on shipping company requirements
    // Example: HMAC verification
    
    if (!signature) return true; // Skip if no signature

    const crypto = require('crypto');
    const secret = process.env.SHIPPING_WEBHOOK_SECRET || '';
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(data))
      .digest('hex');

    return signature === expectedSignature;
  }
}

// ============================================
// 📝 مثال على الاستخدام في API Route
// ============================================

/*
// src/app/api/orders/[id]/ship/route.ts

import { NextResponse } from 'next/server';
import { ShippingService } from '@/lib/shipping-service';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // جلب بيانات الطلب
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // إنشاء شحنة
    const shippingService = new ShippingService();
    const shipment = await shippingService.createShipment({
      orderId: order.id,
      customerName: order.customer.name,
      customerPhone: order.deliveryPhone,
      deliveryAddress: order.deliveryAddress,
      governorate: order.governorate || 'القاهرة',
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
      cashOnDelivery: order.finalAmount,
      deliveryFee: order.deliveryFee,
    });

    return NextResponse.json({
      success: true,
      shipment,
    });
  } catch (error: any) {
    console.error('Error shipping order:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
*/

/*
// ============================================
// 📝 مثال على Webhook Endpoint
// ============================================

// src/app/api/webhooks/shipping/route.ts

import { NextResponse } from 'next/server';
import { ShippingService } from '@/lib/shipping-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature');

    const shippingService = new ShippingService();
    await shippingService.handleWebhook(body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
*/

export { ShippingService };
