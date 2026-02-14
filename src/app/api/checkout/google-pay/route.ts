import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Google Pay Payment Processing API
 * 
 * هذا الـ API مخصص لمعالجة المدفوعات عبر Google Pay
 * يمكن ربطه بـ Payment Gateway مثل Stripe, PayTabs, أو Paymob
 */

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      amount,
      currency = "EGP",
      paymentToken, // Google Pay token
      customerInfo,
    } = body;

    // التحقق من البيانات المطلوبة
    if (!orderId || !amount || !paymentToken) {
      return NextResponse.json(
        { error: "بيانات غير كاملة" },
        { status: 400 }
      );
    }

    // التحقق من الطلب
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    if (order.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بهذا الإجراء" },
        { status: 403 }
      );
    }

    // ========================================
    // TODO: دمج Payment Gateway هنا
    // ========================================
    
    /**
     * مثال استخدام Stripe:
     * 
     * const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
     * 
     * const paymentIntent = await stripe.paymentIntents.create({
     *   amount: Math.round(amount * 100), // Convert to cents
     *   currency: currency.toLowerCase(),
     *   payment_method_data: {
     *     type: 'card',
     *     token: paymentToken, // Google Pay token
     *   },
     *   confirm: true,
     * });
     * 
     * if (paymentIntent.status !== 'succeeded') {
     *   throw new Error('فشل الدفع');
     * }
     * 
     * const transactionId = paymentIntent.id;
     */

    /**
     * مثال استخدام Paymob:
     * 
     * const paymobResponse = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({
     *     auth_token: process.env.PAYMOB_API_KEY,
     *     amount_cents: Math.round(amount * 100),
     *     currency: currency,
     *     payment_token: paymentToken,
     *     billing_data: customerInfo,
     *   }),
     * });
     * 
     * const paymobData = await paymobResponse.json();
     * 
     * if (!paymobData.success) {
     *   throw new Error(paymobData.message || 'فشل الدفع');
     * }
     * 
     * const transactionId = paymobData.id;
     */

    // ========================================
    // Mockup Response (for development/testing)
    // ========================================
    
    // محاكاة معالجة الدفع (يجب استبداله بـ API حقيقي)
    const mockSuccess = Math.random() > 0.1; // 90% success rate for testing

    if (!mockSuccess) {
      return NextResponse.json(
        { 
          error: "فشل الدفع", 
          message: "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى." 
        },
        { status: 400 }
      );
    }

    const transactionId = `gpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // تحديث حالة الطلب
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentMethod: "GOOGLE_PAY",
        paymentDetails: {
          transactionId,
          paymentToken: paymentToken.substring(0, 20) + "...", // Store partial token for reference
          paidAt: new Date().toISOString(),
          amount,
          currency,
          method: "Google Pay",
        },
        updatedAt: new Date(),
      },
    });

    // إنشاء سجل معاملة (ملحوظة: لا يوجد model Transaction - سيتم حفظها في paymentDetails)
    // await prisma.transaction.create({ ... });

    // تحديث نقاط العميل (إذا كان هناك نظام نقاط)
    if (session.user.id) {
      const pointsToAdd = Math.floor(amount / 100); // 1 point per 100 EGP
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: pointsToAdd,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم الدفع بنجاح! ✅",
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        transactionId,
      },
      pointsEarned: Math.floor(amount / 100),
    });

  } catch (error: any) {
    console.error("Google Pay processing error:", error);
    return NextResponse.json(
      { 
        error: "خطأ في معالجة الدفع", 
        message: error.message || "حدث خطأ غير متوقع" 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint لجلب إعدادات Google Pay
 */
export async function GET(req: NextRequest) {
  try {
    // يمكن استخدامه لجلب إعدادات Google Pay من قاعدة البيانات
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'google_pay_enabled',
            'google_pay_merchant_id',
            'google_pay_merchant_name',
            'payment_gateway_provider',
          ],
        },
      },
    });

    const config: any = {};
    settings.forEach((s: any) => {
      config[s.key] = s.value;
    });

    return NextResponse.json({
      enabled: config.google_pay_enabled === 'true',
      merchantId: config.google_pay_merchant_id || '',
      merchantName: config.google_pay_merchant_name || 'Remo Store',
      gatewayProvider: config.payment_gateway_provider || 'stripe',
    });

  } catch (error: any) {
    console.error("Error fetching Google Pay settings:", error);
    return NextResponse.json(
      { error: "خطأ في جلب الإعدادات" },
      { status: 500 }
    );
  }
}
