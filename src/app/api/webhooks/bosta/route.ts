// 🔔 Bosta Webhook Handler
// معالج Webhook من شركة بوسطة للتحديثات التلقائية

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BostaService } from '@/lib/bosta-service';

export async function POST(request: Request) {
  try {
    // 🔐 Verify Webhook Signature
    const signature = request.headers.get('bosta_webhook_key') || request.headers.get('bosta-webhook-key');
    const webhookSecret = process.env.BUSTA_WEBHOOK_SECRET;

    if (webhookSecret && signature !== webhookSecret) {
      console.log('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('📦 ========================================');
    console.log('📦 Bosta Webhook Received');
    console.log('📦 ========================================');
    console.log(JSON.stringify(body, null, 2));

    // استخراج البيانات من الـ Webhook
    const {
      _id,                  // Bosta Shipment ID
      trackingNumber,       // رقم التتبع
      state,                // حالة الشحنة (10, 11, 20, 21, 30, 40, 45)
      deliveryStatus,       // تفاصيل الحالة
      orderReference,       // رقم طلبك (Order ID)
      cod,                  // المبلغ المطلوب
      customer,             // بيانات العميل
    } = body;

    // ابحث عن الطلب في قاعدة البيانات
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderReference },
          { bustaShipmentId: _id },
          { orderNumber: trackingNumber },
        ],
      },
      include: {
        customer: true,
      },
    });

    if (!order) {
      console.log('⚠️ Order not found:', {
        orderReference,
        shipmentId: _id,
        trackingNumber,
      });
      
      // ✅ Return 200 even if order not found (to prevent Bosta retries)
      return NextResponse.json({
        success: false,
        message: 'Order not found but acknowledged',
      });
    }

    console.log('✅ Order found:', order.orderNumber);

    // حدّث حالة الطلب
    const newStatus = BostaService.mapBostaStatusToOrderStatus(state?.toString() || '10');
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        bustaShipmentId: _id,
        bustaStatus: state?.toString() || '',
        bustaTrackingUrl: `https://bosta.co/tracking/${trackingNumber}`,
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Order updated successfully:', {
      orderNumber: order.orderNumber,
      oldStatus: order.status,
      newStatus: newStatus,
      bostaState: state,
    });

    // 📧 إرسال إشعارات للعميل (اختياري)
    await sendNotificationToCustomer(order, newStatus, trackingNumber);

    console.log('📦 ========================================');

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderNumber: order.orderNumber,
      newStatus: newStatus,
    });
  } catch (error: any) {
    console.error('❌ ========================================');
    console.error('❌ Webhook Error:', error);
    console.error('❌ ========================================');
    
    return NextResponse.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * إرسال إشعار للعميل بتحديث حالة الطلب
 */
async function sendNotificationToCustomer(
  order: any,
  newStatus: string,
  trackingNumber: string
) {
  try {
    const statusMessages: Record<string, string> = {
      'CONFIRMED': 'تم تأكيد طلبك وجاري التحضير',
      'PREPARING': 'يتم تجهيز طلبك للشحن',
      'SHIPPED': 'تم شحن طلبك وفي الطريق إليك',
      'DELIVERED': 'تم توصيل طلبك بنجاح',
      'CANCELLED': 'تم إلغاء الطلب',
    };

    const message = statusMessages[newStatus] || 'تم تحديث حالة طلبك';

    console.log(`📧 Notification: ${message}`);
    console.log(`   Customer: ${order.customer.name}`);
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Tracking: https://bosta.co/tracking/${trackingNumber}`);

    // TODO: هنا يمكنك إضافة كود إرسال إشعارات:
    // - إشعارات Push
    // - رسائل SMS
    // - Email
    // - WhatsApp

  } catch (error) {
    console.error('⚠️ Failed to send notification:', error);
    // Don't throw - notification failure shouldn't fail the webhook
  }
}

// GET endpoint للاختبار فقط
export async function GET() {
  return NextResponse.json({
    message: 'Bosta Webhook Endpoint',
    status: 'Active',
    url: '/api/webhooks/bosta',
    method: 'POST',
  });
}
