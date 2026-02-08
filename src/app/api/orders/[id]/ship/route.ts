// 🚚 Ship Order - إرسال الطلب مع شركة بوسطة
// API Endpoint لإرسال طلب للشحن

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BostaService } from '@/lib/bosta-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // 🔐 تحقق من الصلاحيات (Vendor أو Admin فقط)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      );
    }

    const userRole = session.user.role;
    if (!['VENDOR', 'ADMIN', 'DEVELOPER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية شحن الطلبات' },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // 📦 جلب تفاصيل الطلب مع بيانات الـ Vendor
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        vendor: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // ✅ تحقق من وجود عنوان المتجر (للاستلام)
    if (!order.vendor) {
      return NextResponse.json(
        { error: 'الطلب غير مرتبط ببائع' },
        { status: 400 }
      );
    }

    if (!order.vendor.governorate || !order.vendor.city || !order.vendor.street) {
      return NextResponse.json(
        { 
          error: 'عنوان المتجر غير مكتمل',
          message: 'يرجى إضافة عنوان المتجر أولاً من صفحة "عنوان المتجر"',
          missingFields: {
            governorate: !order.vendor.governorate,
            city: !order.vendor.city,
            street: !order.vendor.street,
          }
        },
        { status: 400 }
      );
    }

    // بناء عنوان المتجر الكامل للاستلام
    const pickupAddressParts = [];
    if (order.vendor.street) pickupAddressParts.push(order.vendor.street);
    if (order.vendor.buildingNumber) pickupAddressParts.push(`عمارة ${order.vendor.buildingNumber}`);
    if (order.vendor.floorNumber) pickupAddressParts.push(`الطابق ${order.vendor.floorNumber}`);
    if (order.vendor.apartmentNumber) pickupAddressParts.push(`شقة ${order.vendor.apartmentNumber}`);
    if (order.vendor.region) pickupAddressParts.push(order.vendor.region);
    console.log('📍 Pickup from:', pickupAddress);
    console.log('📍 Deliver to:', order.deliveryAddress);

    const bostaService = new BostaService();
    const shipment = await bostaService.createDelivery({
      orderId: order.id,
      // Pickup (Vendor Store Address)
      pickupAddress: pickupAddress,
      pickupCity: order.vendor.city,
      pickupGovernorate: order.vendor.governorate,
      pickupPhone: order.vendor.phone || order.vendor.user?.phone || '',
      pickupName: order.vendor.storeName || order.vendor.businessName || 'المتجر',
      pickupInstructions: order.vendor.pickupInstructions || undefined,
      // Delivery (Customer Address)= order.vendor.address || pickupAddressParts.join('، ');

    // ✅ تحقق من إمكانية الشحن
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'لا يمكن شحن طلب ملغي' },
        { status: 400 }
      );
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'الطلب تم توصيله بالفعل' },
        { status: 400 }
      );
    }

    if (order.bustaShipmentId) {
      return NextResponse.json(
        {
          error: 'الطلب تم شحنه بالفعل',
          shipment: {
            id: order.bustaShipmentId,
            trackingUrl: order.bustaTrackingUrl,
          },
        },
        { status: 400 }
      );
    }

    // 🚚 إنشاء شحنة في بوسطة
    console.log('🚚 Creating shipment for order:', order.orderNumber);

    const bostaService = new BostaService();
    const shipment = await bostaService.createDelivery({
      orderId: order.id,
      customerName: order.customer.name,
      customerPhone: order.deliveryPhone,
      customerEmail: order.customer.email || undefined,
      deliveryAddress: order.deliveryAddress,
      city: order.governorate || 'القاهرة',
      zone: '', // يمكن إضافة Zone إذا متوفر
      cashOnDelivery: order.finalAmount,
      notes: order.customerNotes || 'فحص المنتج قبل الدفع',
    });

    if (!shipment.success) {
      return NextResponse.json(
        {
          error: shipment.error || 'فشل إنشاء الشحنة',
          details: 'حدث خطأ أثناء التواصل مع شركة الشحن',
        },
        { status: 500 }
      );
    }

    console.log('✅ Shipment created successfully:', shipment.shipmentId);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الطلب لشركة بوسطة بنجاح',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'SHIPPED',
      },
      shipment: {
        id: shipment.shipmentId,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
      },
    });
  } catch (error: any) {
    console.error('❌ Ship Order Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'حدث خطأ أثناء شحن الطلب',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint - للحصول على حالة الشحنة
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      );
    }

    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        bustaShipmentId: true,
        bustaStatus: true,
        bustaTrackingUrl: true,
        bustaSentAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order,
      shipped: !!order.bustaShipmentId,
    });
  } catch (error: any) {
    console.error('❌ Get Shipment Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
