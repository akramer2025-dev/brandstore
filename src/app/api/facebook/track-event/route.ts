// API Endpoint to track events from frontend
import { NextRequest, NextResponse } from 'next/server';
import { fbCAPI } from '@/lib/facebook-capi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventData } = body;

    // Get IP and User Agent from request
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Common data
    const commonData = {
      ip: ip.split(',')[0].trim(),
      userAgent,
      url: eventData.url || '',
      fbp: eventData.fbp, // من Facebook Pixel cookie
      fbc: eventData.fbc, // من Facebook Click ID
      email: eventData.email,
      phone: eventData.phone,
    };

    let success = false;

    switch (eventName) {
      case 'PageView':
        success = await fbCAPI.trackPageView(commonData);
        break;

      case 'ViewContent':
        success = await fbCAPI.trackViewContent({
          ...commonData,
          productId: eventData.productId,
          productName: eventData.productName,
          price: eventData.price,
        });
        break;

      case 'AddToCart':
        success = await fbCAPI.trackAddToCart({
          ...commonData,
          productId: eventData.productId,
          productName: eventData.productName,
          price: eventData.price,
          quantity: eventData.quantity || 1,
        });
        break;

      case 'InitiateCheckout':
        success = await fbCAPI.trackInitiateCheckout({
          ...commonData,
          productIds: eventData.productIds || [],
          totalValue: eventData.totalValue,
          numItems: eventData.numItems,
        });
        break;

      case 'Purchase':
        success = await fbCAPI.trackPurchase({
          ...commonData,
          orderId: eventData.orderId,
          productIds: eventData.productIds || [],
          totalValue: eventData.totalValue,
          numItems: eventData.numItems,
          phone: eventData.phone, // Required for orders
        });
        break;

      case 'Lead':
        success = await fbCAPI.trackLead(commonData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event name' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success });

  } catch (error: any) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
