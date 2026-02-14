import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/order-service";
import { fbCAPI } from "@/lib/facebook-capi";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const order = await OrderService.createOrder({
      customerId: session.user.id,
      items: body.items,
      deliveryAddress: body.deliveryAddress,
      deliveryPhone: body.deliveryPhone,
      customerNotes: body.customerNotes,
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

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
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
