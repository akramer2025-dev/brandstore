// 🚚 Bosta Shipping Service
// خدمة التكامل مع شركة بوسطة للشحن

import { prisma } from './prisma';

interface BostaDeliveryData {
  orderId: string;
  // Pickup (Vendor Store Address)
  pickupAddress?: string;
  pickupCity?: string;
  pickupGovernorate?: string;
  pickupPhone?: string;
  pickupName?: string;
  pickupInstructions?: string;
  // Delivery (Customer Address)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  city: string;
  zone?: string;
  cashOnDelivery: number;
  notes?: string;
}

interface BostaResponse {
  success: boolean;
  shipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  error?: string;
}

export class BostaService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BUSTA_API_KEY || '';
    this.baseUrl = process.env.BUSTA_API_URL || 'http://app.bosta.co/api/v2';

    if (!this.apiKey) {
      throw new Error('Bosta API Key is missing! Check your .env file');
    }
  }

  /**
   * إنشاء شحنة جديدة في بوسطة
   * Create new delivery in Bosta
   */
  async createDelivery(data: BostaDeliveryData): Promise<BostaResponse> {
    try {
      console.log('📦 Creating Bosta delivery for order:', data.orderId);

      const response = await fetch(`${this.baseUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          type: 10, // Delivery Type (10 = Send)
          specs: {
            packageType: 'Package',
            size: 'SMALL', // SMALL, MEDIUM, LARGE
            packageDetails: {
              itemsCount: 1,
              description: 'ملابس',
            },
          },
          // 📍 Pickup Address (Vendor Store) - عنوان استلام الشحنة من المتجر
          ...(data.pickupAddress && {
            pickupAddress: {
              firstLine: data.pickupAddress,
              city: {
                name: data.pickupCity || data.pickupGovernorate || 'القاهرة',
              },
              zone: '',
            },
            sender: {
              firstName: data.pickupName || 'المتجر',
              phone: data.pickupPhone || '',
            },
          }),
          // 📍 Delivery Address (Customer) - عنوان توصيل الشحنة للعميل
          dropOffAddress: {
            firstLine: data.deliveryAddress,
            city: {
              name: data.city,
            },
            zone: data.zone || '',
          },
          receiver: {
            firstName: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail || '',
          },
          cod: data.cashOnDelivery, // Cash on Delivery amount
          allowToOpenPackage: true, // السماح بفتح الطرد للفحص
          businessReference: data.orderId, // رقم الطلب عندك
          notes: [
            data.notes || 'فحص المنتج قبل الدفع',
            data.pickupInstructions ? `تعليمات الاستلام: ${data.pickupInstructions}` : '',
          ].filter(Boolean).join(' - '),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Bosta API Error:', result);
        throw new Error(result.message || 'Failed to create delivery');
      }

      console.log('✅ Bosta delivery created:', result._id);

      // حفظ بيانات الشحنة في قاعدة البيانات
      await this.updateOrderWithShipment(data.orderId, result);

      return {
        success: true,
        shipmentId: result._id,
        trackingNumber: result.trackingNumber,
        trackingUrl: `https://bosta.co/tracking/${result.trackingNumber}`,
      };
    } catch (error: any) {
      console.error('❌ Bosta Service Error:', error);
      return {
        success: false,
        error: error.message || 'فشل إنشاء الشحنة',
      };
    }
  }

  /**
   * تتبع الشحنة
   * Track delivery status
   */
  async trackDelivery(trackingNumber: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/deliveries/trackingNumber/${trackingNumber}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to track delivery');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Track Delivery Error:', error);
      throw error;
    }
  }

  /**
   * حساب تكلفة الشحن
   * Calculate delivery fee based on city and COD amount
   */
  async calculateDeliveryFee(city: string, codAmount: number): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/pricing`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city,
          type: 10, // Send
          cod: codAmount,
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Failed to calculate fee, using default');
        return 50; // Default fee
      }

      const result = await response.json();
      return result.deliveryFees || 50;
    } catch (error) {
      console.error('❌ Calculate Fee Error:', error);
      return 50; // Default fee on error
    }
  }

  /**
   * إلغاء الشحنة
   * Cancel delivery
   */
  async cancelDelivery(deliveryId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/deliveries/${deliveryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel delivery');
      }

      return { success: true, message: 'تم إلغاء الشحنة بنجاح' };
    } catch (error: any) {
      console.error('❌ Cancel Delivery Error:', error);
      throw error;
    }
  }

  /**
   * تحديث بيانات الطلب في قاعدة البيانات
   * Update order in database with Bosta shipment info
   */
  private async updateOrderWithShipment(orderId: string, bostaData: any) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          bustaShipmentId: bostaData._id,
          bustaTrackingUrl: `https://bosta.co/tracking/${bostaData.trackingNumber}`,
          bustaStatus: bostaData.state?.toString() || 'CREATED',
          bustaSentAt: new Date(),
          status: 'SHIPPED', // تحديث حالة الطلب
        },
      });

      console.log('✅ Order updated with Bosta info:', orderId);
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      throw error;
    }
  }

  /**
   * تحويل حالة بوسطة لحالة الطلب
   * Map Bosta status to order status
   */
  static mapBostaStatusToOrderStatus(bostaState: string): string {
    const statusMap: Record<string, string> = {
      '10': 'CONFIRMED',   // Ticket Created
      '11': 'PREPARING',   // Package Picked up from Business
      '20': 'SHIPPED',     // Package at Warehouse
      '21': 'SHIPPED',     // Out for Delivery
      '30': 'DELIVERED',   // Delivered
      '40': 'CANCELLED',   // Delivery Failed
      '45': 'CANCELLED',   // Returned to Business
    };

    return statusMap[bostaState] || 'PENDING';
  }

  /**
   * الحصول على تفاصيل الشحنة من الـ ID
   * Get delivery details by ID
   */
  async getDeliveryById(deliveryId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/deliveries/${deliveryId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get delivery details');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get Delivery Error:', error);
      throw error;
    }
  }
}
