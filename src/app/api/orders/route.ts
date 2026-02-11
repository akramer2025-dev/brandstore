import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrderService } from "@/lib/order-service";

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
