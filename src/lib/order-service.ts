import { prisma } from './prisma';
import { InventoryService } from './inventory-service';

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
    const finalAmount = totalAmount + deliveryFee;
    const paymentMethod = data.paymentMethod || 'CASH_ON_DELIVERY';

    // إنشاء الطلب
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        totalAmount,
        deliveryFee,
        finalAmount,
        deliveryAddress: data.deliveryAddress,
        deliveryPhone: data.deliveryPhone,
        customerNotes: data.customerNotes,
        paymentMethod,
        eWalletType: data.eWalletType,
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
      where: { customerId },
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
}
