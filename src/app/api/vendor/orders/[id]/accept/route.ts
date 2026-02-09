import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Accept order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json(
        { message: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { 
        id,
        vendorId: vendor.id,
        status: 'PENDING',
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'الطلب غير موجود أو لا يمكن قبوله' },
        { status: 404 }
      );
    }

    // التحقق من أن هناك صورة إيصال للتحويلات البنكية/المحفظة
    if ((order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'E_WALLET_TRANSFER') 
        && !order.bankTransferReceipt) {
      return NextResponse.json(
        { message: 'يجب على العميل إرفاق صورة التحويل أولاً' },
        { status: 400 }
      );
    }

    let currentBalance = vendor.capitalBalance || 0;

    // **معالجة التحويل البنكي/المحفظة: تحديث رأس المال فوراً**
    if (order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'E_WALLET_TRANSFER') {
      // حساب الأرباح لكل منتج
      for (const item of order.items) {
        const product = item.product;
        const productRevenue = item.price * item.quantity;
        
        if (product.productSource === 'OWNED') {
          // منتج مملوك: الربح = سعر البيع - تكلفة الإنتاج
          const productCost = (product.supplierCost || product.productionCost || 0) * item.quantity;
          const profit = productRevenue - productCost;

          currentBalance += profit;

          // تسجيل معاملة رأس المال
          await prisma.capitalTransaction.create({
            data: {
              vendorId: vendor.id,
              type: 'SALE_PROFIT',
              amount: profit,
              balanceBefore: currentBalance - profit,
              balanceAfter: currentBalance,
              description: `Bank/E-Wallet payment - Order #${order.orderNumber}`,
              descriptionAr: `دفع ${order.paymentMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'محفظة'} - طلب #${order.orderNumber} (${item.quantity} × ${product.nameAr})`,
              orderId: order.id,
            },
          });

          // تسجيل البيع
          await prisma.sale.create({
            data: {
              vendorId: vendor.id,
              productName: product.name,
              productNameAr: product.nameAr,
              quantity: item.quantity,
              unitPrice: item.price,
              totalAmount: productRevenue,
              costPrice: product.supplierCost || product.productionCost,
              profit: profit,
              saleDate: new Date(),
              customerName: order.customer?.name,
              customerPhone: order.deliveryPhone,
              invoiceNumber: order.orderNumber,
              notes: `${order.paymentMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'تحويل محفظة'}${order.eWalletType ? ' - ' + order.eWalletType : ''}`,
            },
          });
        } 
        else if (product.productSource === 'CONSIGNMENT' && product.supplierCost) {
          // منتج وسيط: الربح = سعر البيع - مستحقات المورد
          const amountDue = product.supplierCost * item.quantity;
          const profit = productRevenue - amountDue;

          currentBalance += profit;

          // إنشاء سجل مستحقات للمورد
          await prisma.supplierPayment.create({
            data: {
              vendorId: vendor.id,
              productId: product.id,
              orderId: order.id,
              supplierName: product.supplierName || 'مورد غير محدد',
              supplierPhone: product.supplierPhone,
              amountDue: amountDue,
              amountPaid: 0,
              profit: profit,
              saleDate: new Date(),
              status: 'PENDING',
              notes: `من طلب #${order.orderNumber} - ${item.quantity} قطعة`,
            },
          });

          // تسجيل معاملة ربح الوسيط
          await prisma.capitalTransaction.create({
            data: {
              vendorId: vendor.id,
              type: 'CONSIGNMENT_PROFIT',
              amount: profit,
              balanceBefore: currentBalance - profit,
              balanceAfter: currentBalance,
              description: `Consignment profit - Bank/E-Wallet - Order #${order.orderNumber}`,
              descriptionAr: `ربح وسيط - ${order.paymentMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'محفظة'} - طلب #${order.orderNumber}`,
              orderId: order.id,
            },
          });

          // تسجيل البيع
          await prisma.sale.create({
            data: {
              vendorId: vendor.id,
              productName: product.name,
              productNameAr: product.nameAr,
              quantity: item.quantity,
              unitPrice: item.price,
              totalAmount: productRevenue,
              costPrice: product.supplierCost,
              profit: profit,
              saleDate: new Date(),
              customerName: order.customer?.name,
              customerPhone: order.deliveryPhone,
              invoiceNumber: order.orderNumber,
              notes: `${order.paymentMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : 'تحويل محفظة'} | وسيط: ${product.supplierName}`,
            },
          });
        }
      }

      // تحديث رصيد رأس المال النهائي
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { capitalBalance: currentBalance },
      });

      // تحديث حالة الدفع
      await prisma.order.update({
        where: { id },
        data: { paymentStatus: 'PAID' },
      });
    }

    // Update order status to CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // إنشاء إشعار للعميل بقبول الطلب
    await prisma.customerNotification.create({
      data: {
        customerId: updatedOrder.customerId,
        type: 'ORDER_CONFIRMED',
        title: 'تم قبول طلبك! 🎉',
        message: `تم قبول طلبك رقم ${updatedOrder.orderNumber} وجاري تجهيزه للشحن`,
        orderId: updatedOrder.id,
      },
    });

    // إرسال Push Notification للعميل (حتى لو التطبيق مقفول)
    const { sendPushToCustomer } = await import('@/lib/push-service');
    await sendPushToCustomer(updatedOrder.customerId, {
      title: 'تم قبول طلبك! 🎉',
      body: `طلبك رقم ${updatedOrder.orderNumber} جاري تجهيزه`,
      data: {
        type: 'ORDER_CONFIRMED',
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
      },
      actions: [
        {
          action: 'view',
          title: 'عرض الطلب',
        },
      ],
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { message: 'فشل في قبول الطلب' },
      { status: 500 }
    );
  }
}
