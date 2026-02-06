import { prisma } from './prisma';
import { InventoryService } from './inventory-service';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export class OrderService {
  /**
   * إنشاء طلب جديد
   */
  static async createOrder(data: {
    customerId: string;
    items: Array<{ productId: string; quantity: number }>;
    deliveryAddress: string;
    deliveryPhone: string;
    customerNotes?: string;
    deliveryFee?: number;
    paymentMethod?: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'E_WALLET_TRANSFER' | 'INSTALLMENT_4' | 'INSTALLMENT_6' | 'INSTALLMENT_12' | 'INSTALLMENT_24';
    eWalletType?: string;
    deliveryMethod?: 'HOME_DELIVERY' | 'STORE_PICKUP';
    governorate?: string;
    pickupLocation?: string;
    downPayment?: number;
    remainingAmount?: number;
    installmentPlan?: {
      totalAmount: number;
      downPayment: number;
      monthlyAmount: number;
      numberOfMonths: number;
      interestRate: number;
    };
  }) {
    // التحقق من توفر المنتجات في المخزون
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`المنتج غير موجود`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `الكمية المطلوبة من ${product.nameAr} غير متوفرة. المتاح: ${product.stock}`
        );
      }
    }

    // حساب إجمالي المبلغ
    let totalAmount = 0;
    const orderItems = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    const deliveryFee = data.deliveryFee || 30; // رسوم التوصيل الافتراضية
    const deliveryMethod = data.deliveryMethod || 'HOME_DELIVERY';
    
    // حساب المبلغ النهائي بناءً على طريقة التوصيل
    let finalAmount = totalAmount + deliveryFee;
    if (deliveryMethod === 'STORE_PICKUP') {
      finalAmount = data.downPayment || 0; // للاستلام من الفرع، المبلغ النهائي هو الدفعة المقدمة
    }
    
    const paymentMethod = data.paymentMethod || 'CASH_ON_DELIVERY';

    // الحصول على vendorId من أول منتج (نفترض أن كل المنتجات من نفس الشريك)
    const firstProduct = await prisma.product.findUnique({
      where: { id: data.items[0].productId },
      select: { vendorId: true }
    });

    // إنشاء الطلب
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        vendorId: firstProduct?.vendorId || null, // ربط الطلب بالشريك
        totalAmount,
        deliveryFee: deliveryMethod === 'HOME_DELIVERY' ? deliveryFee : 0,
        finalAmount,
        deliveryAddress: data.deliveryAddress,
        deliveryPhone: data.deliveryPhone,
        customerNotes: data.customerNotes,
        paymentMethod,
        eWalletType: data.eWalletType,
        deliveryMethod,
        governorate: data.governorate,
        pickupLocation: data.pickupLocation,
        downPayment: data.downPayment,
        remainingAmount: data.remainingAmount,
        items: {
          create: orderItems,
        },
        // إنشاء خطة التقسيط إذا كان الدفع بالتقسيط
        ...(paymentMethod.startsWith('INSTALLMENT_') && data.installmentPlan
          ? {
              installment: {
                create: {
                  totalAmount: data.installmentPlan.totalAmount,
                  downPayment: data.installmentPlan.downPayment,
                  monthlyAmount: data.installmentPlan.monthlyAmount,
                  numberOfMonths: data.installmentPlan.numberOfMonths,
                  interestRate: data.installmentPlan.interestRate,
                  startDate: new Date(),
                  endDate: new Date(
                    Date.now() + data.installmentPlan.numberOfMonths * 30 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        installmentPlan: true,
      },
    });

    // خصم المنتجات من المخزون
    for (const item of data.items) {
      await InventoryService.deductStock(item.productId, item.quantity);
    }

    // إرسال إشعار للشريك عند إنشاء الطلب
    if (firstProduct?.vendorId) {
      await this.sendVendorNotification({
        vendorId: firstProduct.vendorId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name || order.customer.username || 'عميل',
        totalAmount: order.totalAmount,
        itemsCount: data.items.length,
      });
    }

    // إرسال إيميل تلقائي لشركة بوسطة للشحن (للتوصيل المنزلي فقط)
    if (deliveryMethod === 'HOME_DELIVERY') {
      try {
        await this.sendToBustaShipping(order.id);
      } catch (error) {
        console.error('Error sending to Busta shipping:', error);
        // لا نوقف العملية إذا فشل إرسال الإيميل
      }
    }

    return order;
  }

  /**
   * تعيين موظف توصيل للطلب
   */
  static async assignDeliveryStaff(orderId: string, deliveryStaffId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStaffId,
        status: 'OUT_FOR_DELIVERY',
      },
      include: {
        deliveryStaff: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // إرسال رسالة واتساب لموظف التوصيل
    if (order.deliveryStaff) {
      await this.sendWhatsAppToDeliveryStaff(order);
    }

    return order;
  }

  /**
   * إرسال رسالة واتساب لموظف التوصيل
   */
  private static async sendWhatsAppToDeliveryStaff(order: any) {
    try {
      const phone = order.deliveryStaff.phone.replace(/[^0-9]/g, ''); // تنظيف رقم الهاتف
      
      // إنشاء قائمة المنتجات
      const productsList = order.items
        .map((item: any, index: number) => 
          `${index + 1}. ${item.product.nameAr} - الكمية: ${item.quantity} - السعر: ${item.price.toFixed(2)} جنيه`
        )
        .join('\n');

      // رسالة الواتساب
      const message = `
🚚 *طلب توصيل جديد*

📦 *رقم الطلب:* ${order.orderNumber.slice(0, 8).toUpperCase()}

👤 *معلومات العميل:*
• الاسم: ${order.customer.name || order.customer.username}
• الهاتف: ${order.deliveryPhone}

📍 *عنوان التوصيل:*
${order.deliveryAddress}

🛍️ *المنتجات:*
${productsList}

💰 *تفاصيل المبلغ:*
• المجموع الفرعي: ${order.totalAmount.toFixed(2)} جنيه
• رسوم التوصيل: ${order.deliveryFee.toFixed(2)} جنيه
• الإجمالي: ${order.finalAmount.toFixed(2)} جنيه

📝 *ملاحظات العميل:*
${order.customerNotes || 'لا توجد ملاحظات'}

⚠️ *مهم:*
• يرجى الاتصال بالعميل قبل التوجه للعنوان
• تأكد من فحص المنتجات مع العميل قبل استلام المبلغ
• في حالة رفض العميل، استلم رسوم التوصيل فقط (${order.deliveryFee.toFixed(2)} جنيه)

✅ بالتوفيق في التوصيل!
      `.trim();

      // إنشاء رابط واتساب
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      // في بيئة الإنتاج، يمكنك استخدام WhatsApp Business API
      // هنا نسجل فقط في console للتطوير
      console.log('📱 WhatsApp Message URL:', whatsappUrl);
      console.log('✉️ Message sent to:', order.deliveryStaff.name, '(', phone, ')');
      
      // يمكنك إضافة integration مع WhatsApp API هنا
      // مثل: await fetch('whatsapp-api-endpoint', { ... })
      
      return whatsappUrl;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      // لا نريد أن يفشل تعيين الموظف بسبب فشل إرسال الرسالة
    }
  }

  /**
   * تحديث حالة الطلب من موظف التوصيل
   */
  static async updateOrderStatus(
    orderId: string,
    inspectionResult: 'ACCEPTED' | 'REJECTED',
    rejectionReason?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryStaff: true,
      },
    });

    if (!order) {
      throw new Error('الطلب غير موجود');
    }

    let paymentStatus;
    let orderStatus;
    let finalAmount = order.finalAmount;

    if (inspectionResult === 'ACCEPTED') {
      // العميل قبل المنتج
      paymentStatus = 'PAID';
      orderStatus = 'DELIVERED';

      // إنشاء سجلات مستحقات الموردين للمنتجات الوسيط
      for (const item of order.items) {
        if (item.product.productSource === 'CONSIGNMENT' && item.product.supplierCost) {
          // إنشاء سجل مستحقات للمورد
          const profit = (item.price - item.product.supplierCost) * item.quantity;
          const amountDue = item.product.supplierCost * item.quantity;

          await prisma.supplierPayment.create({
            data: {
              vendorId: item.product.vendorId!,
              productId: item.product.id,
              orderId: order.id,
              supplierName: item.product.supplierName || 'مورد غير محدد',
              supplierPhone: item.product.supplierPhone,
              amountDue: amountDue,
              amountPaid: 0,
              profit: profit,
              saleDate: new Date(),
              status: 'PENDING',
              notes: `من طلب #${order.orderNumber} - ${item.quantity} قطعة`,
            },
          });

          // إنشاء معاملة ربح الوسيط في رأس المال
          // نحصل أولاً على آخر رصيد
          const lastTransaction = await prisma.capitalTransaction.findFirst({
            where: { vendorId: item.product.vendorId! },
            orderBy: { createdAt: 'desc' },
          });
          const currentBalance = lastTransaction?.balanceAfter || 0;

          await prisma.capitalTransaction.create({
            data: {
              vendorId: item.product.vendorId!,
              type: 'CONSIGNMENT_PROFIT',
              amount: profit,
              balanceBefore: currentBalance,
              balanceAfter: currentBalance + profit,
              description: `Profit from consignment sale - Order #${order.orderNumber}`,
              descriptionAr: `ربح من بيع وسيط - طلب #${order.orderNumber}`,
              orderId: order.id,
            },
          });
        }
      }

      // تحديث إحصائيات موظف التوصيل
      if (order.deliveryStaffId) {
        await prisma.deliveryStaff.update({
          where: { id: order.deliveryStaffId },
          data: {
            totalDeliveries: {
              increment: 1,
            },
            successfulDeliveries: {
              increment: 1,
            },
          },
        });
      }
    } else {
      // العميل رفض المنتج
      paymentStatus = 'DELIVERY_FEE_ONLY';
      orderStatus = 'REJECTED';
      finalAmount = order.deliveryFee; // يدفع رسوم التوصيل فقط

      // إرجاع المنتجات للمخزون
      for (const item of order.items) {
        await InventoryService.addStock(
          item.productId,
          item.quantity,
          `إرجاع من طلب مرفوض #${order.orderNumber}`
        );
      }

      // تحديث إحصائيات موظف التوصيل
      if (order.deliveryStaffId) {
        await prisma.deliveryStaff.update({
          where: { id: order.deliveryStaffId },
          data: {
            totalDeliveries: {
              increment: 1,
            },
          },
        });
      }
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus as any,
        paymentStatus: paymentStatus as any,
        inspectionResult: inspectionResult as any,
        rejectionReason,
        finalAmount,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryStaff: true,
        customer: true,
      },
    });
  }

  /**
   * الحصول على طلبات موظف التوصيل
   */
  static async getDeliveryStaffOrders(deliveryStaffId: string) {
    return prisma.order.findMany({
      where: {
        deliveryStaffId,
        status: {
          in: ['OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * الحصول على طلبات العميل
   */
  static async getCustomerOrders(customerId: string) {
    return prisma.order.findMany({
      where: { 
        customerId,
        deletedAt: null, // فقط الطلبات الموجودة (غير محذوفة)
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryStaff: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * إلغاء طلب
   */
  static async cancelOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error('الطلب غير موجود');
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new Error('لا يمكن إلغاء الطلب في هذه المرحلة');
    }

    // إرجاع المنتجات للمخزون
    for (const item of order.items) {
      await InventoryService.addStock(
        item.productId,
        item.quantity,
        `إلغاء طلب #${order.orderNumber}`
      );
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  /**
   * إرسال إشعار للشريك
   */
  private static async sendVendorNotification(data: {
    vendorId: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemsCount: number;
  }) {
    try {
      await prisma.vendorNotification.create({
        data: {
          vendorId: data.vendorId,
          type: 'NEW_ORDER',
          title: '🎉 طلب جديد!',
          message: `لديك طلب جديد من ${data.customerName} بقيمة ${data.totalAmount.toFixed(2)} ج.م (${data.itemsCount} منتج). رقم الطلب: #${data.orderNumber.slice(0, 8).toUpperCase()}`,
          orderId: data.orderId,
        },
      });
    } catch (error) {
      console.error('Error sending vendor notification:', error);
    }
  }

  /**
   * إرسال طلب لشركة بوسطة تلقائياً
   */
  private static async sendToBustaShipping(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: { titleAr: true, title: true, price: true },
              },
            },
          },
          customer: {
            select: { name: true, email: true, phone: true },
          },
        },
      });

      if (!order) return;

      const productsHtml = order.items
        .map(
          (item) => `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;">${item.product?.titleAr || item.product?.title}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${(item.quantity * item.price).toFixed(2)} جنيه</td>
          </tr>`
        )
        .join('');

      const bustaEmail = process.env.BUSTA_EMAIL || 'shipping@busta-egypt.com';

      await getResend().emails.send({
        from: 'Remostore <orders@remostore.net>',
        to: [bustaEmail],
        subject: `طلب شحن جديد - رقم الطلب: ${order.orderNumber}`,
        html: `
<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Segoe UI',Tahoma,sans-serif;">
  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;text-align:center;">
    <h1>🚚 طلب شحن جديد من Remostore</h1>
  </div>
  <div style="padding:20px;">
    <div style="border:2px solid #e1e5e9;border-radius:10px;padding:20px;margin:10px 0;background:#f8f9fa;">
      <h2>📦 تفاصيل الطلب</h2>
      <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
      <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
      <p><strong>الدفع:</strong> ${order.paymentMethod === 'CASH_ON_DELIVERY' ? 'دفع عند الاستلام' : 'مدفوع'}</p>
    </div>
    <div style="border:2px solid #e1e5e9;border-radius:10px;padding:20px;margin:10px 0;background:#f8f9fa;">
      <h2>👤 بيانات العميل</h2>
      <p><strong>الاسم:</strong> ${order.customer.name}</p>
      <p><strong>الهاتف:</strong> ${order.deliveryPhone}</p>
      <p><strong>العنوان:</strong> ${order.deliveryAddress}</p>
      ${order.governorate ? `<p><strong>المحافظة:</strong> ${order.governorate}</p>` : ''}
      ${order.customerNotes ? `<p><strong>ملاحظات:</strong> ${order.customerNotes}</p>` : ''}
    </div>
    <div style="border:2px solid #e1e5e9;border-radius:10px;padding:20px;margin:10px 0;background:#f8f9fa;">
      <h2>🛍️ المنتجات</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="background:#667eea;color:white;padding:12px;text-align:right;">المنتج</th>
          <th style="background:#667eea;color:white;padding:12px;">الكمية</th>
          <th style="background:#667eea;color:white;padding:12px;">السعر</th>
        </tr></thead>
        <tbody>${productsHtml}</tbody>
      </table>
      <p style="margin-top:15px;font-size:1.2em;font-weight:bold;color:#28a745;">💰 الإجمالي: ${order.finalAmount.toFixed(2)} جنيه</p>
    </div>
  </div>
</body>
</html>`,
      });

      // تحديث حالة الشحنة
      await prisma.order.update({
        where: { id: orderId },
        data: {
          bustaStatus: 'SENT_TO_BUSTA',
          bustaSentAt: new Date(),
          shippingCompany: 'BOSTA',
        },
      });

      console.log('Order sent to Busta shipping successfully:', orderId);
    } catch (error) {
      console.error('Error sending to Busta shipping:', error);
    }
  }
}
