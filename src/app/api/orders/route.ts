import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/order-service";
import { fbCAPI } from "@/lib/facebook-capi";
import { 
  apiRateLimit, 
  csrfProtection, 
  validateEmail, 
  validatePhone, 
  sanitizeInput,
  secureResponse,
  logSecurityEvent,
  logInvalidInput,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // 🛡️ Rate limiting - 20 طلب جديد لكل 15 دقيقة
    const rateCheck = await apiRateLimit(request);
    if (!rateCheck.success) {
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'medium',
        message: 'تجاوز حد إنشاء الطلبات',
        endpoint: '/api/orders',
        details: { limit: rateCheck.limit },
      });
      
      return NextResponse.json(
        { error: rateCheck.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // 🛡️ CSRF Protection
    const csrfCheck = await csrfProtection(request);
    if (!csrfCheck.success) {
      return csrfCheck.response!;
    }

    const session = await auth();

    if (!session || !session.user?.id) {
      logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'medium',
        message: 'محاولة إنشاء طلب بدون تسجيل دخول',
        endpoint: '/api/orders',
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 🛡️ Input Validation
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      logInvalidInput(request, '/api/orders', { reason: 'Empty items array' });
      return NextResponse.json({ error: "يجب اختيار منتج واحد على الأقل" }, { status: 400 });
    }

    if (body.items.length > 50) {
      logInvalidInput(request, '/api/orders', { reason: 'Too many items', count: body.items.length });
      return NextResponse.json({ error: "عدد المنتجات كبير جداً (الحد الأقصى 50)" }, { status: 400 });
    }

    if (!body.deliveryAddress || body.deliveryAddress.trim().length < 10) {
      logInvalidInput(request, '/api/orders', { reason: 'Invalid delivery address' });
      return NextResponse.json({ error: "عنوان التسليم غير صالح" }, { status: 400 });
    }

    if (!validatePhone(body.deliveryPhone)) {
      logInvalidInput(request, '/api/orders', { reason: 'Invalid phone number', phone: body.deliveryPhone });
      return NextResponse.json({ error: "رقم الهاتف غير صالح" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedAddress = sanitizeInput(body.deliveryAddress);
    const sanitizedNotes = body.customerNotes ? sanitizeInput(body.customerNotes) : undefined;

    const order = await OrderService.createOrder({
      customerId: session.user.id,
      items: body.items,
      deliveryAddress: sanitizedAddress,
      deliveryPhone: body.deliveryPhone,
      customerNotes: sanitizedNotes,
      deliveryFee: body.deliveryFee,
      paymentMethod: body.paymentMethod || 'CASH_ON_DELIVERY',
      eWalletType: body.eWalletType,
      bankTransferReceipt: body.bankTransferReceipt,
      eWalletReceipt: body.eWalletReceipt,
      wePayReceipt: body.wePayReceipt,
      deliveryMethod: body.deliveryMethod,
      governorate: body.governorate,
      pickupLocation: body.pickupLocation,
      downPayment: body.downPayment,
      remainingAmount: body.remainingAmount,
      installmentPlan: body.installmentPlan,
    });

    // 🎯 Track Purchase event to Facebook
    try {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
      const userAgent = request.headers.get('user-agent') || '';
      
      await fbCAPI.trackPurchase({
        orderId: order.id,
        productIds: body.items.map((item: any) => item.productId),
        totalValue: order.total,
        numItems: body.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        phone: body.deliveryPhone,
        email: session.user.email || undefined,
        ip: ip.split(',')[0].trim(),
        userAgent,
        url: body.currentUrl || 'https://www.remostore.net',
        fbp: body.fbp,
        fbc: body.fbc,
      });
      console.log('✅ Purchase event sent to Facebook for order:', order.id);
    } catch (fbError) {
      console.error('⚠️ Failed to send Purchase event to Facebook:', fbError);
      // لا نوقف الطلب إذا فشل التتبع
    }

    console.log('✅ تم إنشاء الطلب بنجاح:', order.id);
    
    return secureResponse({
      success: true,
      order,
      message: 'تم إنشاء الطلب بنجاح',
      remaining: rateCheck.remaining,
    });
  } catch (error: any) {
    console.error("❌ Error creating order:", error);
    request: NextRequest) {
  try {
    // 🛡️ Rate limiting
    const rateCheck = await apiRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: rateCheck.error },
        { status: 429 }
      );
    }

    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await OrderService.getCustomerOrders(session.user.id);

    return secureResponse({
      success: true,
      orders,
      count: orders.length,
      remaining: rateCheck.remaining,
    });
  } catch (error) {
    console.error("❌ 
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await OrderService.getCustomerOrders(session.user.id);

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
