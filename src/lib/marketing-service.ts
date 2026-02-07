import { prisma } from './prisma';

/**
 * حساب العمولات تلقائياً عند إتمام الطلب
 * يتم استدعاء هذه الدالة عند تغيير حالة الطلب إلى DELIVERED
 */
export async function calculateCommissionsForOrder(orderId: string) {
  try {
    console.log(`🔄 بدء حساب العمولات للطلب: ${orderId}`);

    // جلب الطلب مع المنتجات
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                marketingStaff: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`❌ الطلب ${orderId} غير موجود`);
      return { success: false, error: 'الطلب غير موجود' };
    }

    if (order.status !== 'DELIVERED') {
      console.warn(`⚠️ الطلب ${orderId} غير مكتمل (${order.status})`);
      return { success: false, error: 'الطلب غير مكتمل' };
    }

    const commissionsCreated = [];
    let totalCommission = 0;

    // المرور على كل منتج في الطلب
    for (const item of order.items) {
      const product = item.product;

      // تخطي المنتجات غير المستوردة
      if (!product.isImported || !product.marketingStaffId) {
        continue;
      }

      const marketingStaff = product.marketingStaff;

      if (!marketingStaff) {
        console.warn(`⚠️ منتج ${product.id} مستورد بدون موظف تسويق`);
        continue;
      }

      // التحقق من عدم وجود عمولة سابقة
      const existingCommission = await prisma.marketingCommission.findFirst({
        where: {
          orderId: order.id,
          productId: product.id,
          marketingStaffId: marketingStaff.id,
        },
      });

      if (existingCommission) {
        console.log(`⚠️ العمولة موجودة بالفعل للمنتج ${product.nameAr}`);
        continue;
      }

      // حساب العمولة
      const saleAmount = item.price * item.quantity;
      const commissionAmount = saleAmount * marketingStaff.commissionRate / 100;

      // إنشاء سجل العمولة
      const commission = await prisma.marketingCommission.create({
        data: {
          marketingStaffId: marketingStaff.id,
          productId: product.id,
          orderId: order.id,
          orderItemId: item.id,
          productName: product.nameAr,
          saleAmount,
          commissionRate: marketingStaff.commissionRate,
          commissionAmount,
        },
      });

      // تحديث إجمالي المبيعات والعمولات
      await prisma.marketingStaff.update({
        where: { id: marketingStaff.id },
        data: {
          totalSales: { increment: saleAmount },
          totalCommission: { increment: commissionAmount },
        },
      });

      commissionsCreated.push({
        id: commission.id,
        productName: product.nameAr,
        staffName: marketingStaff.name,
        quantity: item.quantity,
        saleAmount,
        commissionAmount,
      });

      totalCommission += commissionAmount;

      console.log(`✅ عمولة: ${commissionAmount.toFixed(2)} جنيه لـ ${marketingStaff.name} (${product.nameAr})`);
    }

    if (commissionsCreated.length === 0) {
      console.log(`ℹ️ لا توجد منتجات مستوردة في الطلب ${orderId}`);
      return {
        success: true,
        commissionsCreated: [],
        totalCommission: 0,
        message: 'لا توجد منتجات مستوردة في الطلب',
      };
    }

    console.log(`✅ تم إنشاء ${commissionsCreated.length} عمولة بإجمالي ${totalCommission.toFixed(2)} جنيه`);

    return {
      success: true,
      commissionsCreated,
      totalCommission,
      message: `تم حساب ${commissionsCreated.length} عمولة`,
    };
  } catch (error) {
    console.error('❌ خطأ في حساب العمولات:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ في حساب العمولات',
    };
  }
}

/**
 * جلب إحصائيات موظف التسويق
 */
export async function getMarketingStaffStats(staffId: string) {
  try {
    const staff = await prisma.marketingStaff.findUnique({
      where: { id: staffId },
      include: {
        _count: {
          select: {
            products: true,
            commissions: true,
          },
        },
        commissions: {
          where: { isPaid: false },
          select: {
            commissionAmount: true,
          },
        },
      },
    });

    if (!staff) {
      return null;
    }

    const unpaidCommissions = staff.commissions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    );

    return {
      name: staff.name,
      phone: staff.phone,
      email: staff.email,
      commissionRate: staff.commissionRate,
      totalProducts: staff._count.products,
      totalCommissions: staff._count.commissions,
      totalSales: staff.totalSales,
      totalCommission: staff.totalCommission,
      unpaidCommissions,
      paidCommissions: staff.totalCommission - unpaidCommissions,
    };
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الموظف:', error);
    return null;
  }
}

/**
 * جلب أفضل الموظفين حسب المبيعات
 */
export async function getTopMarketingStaff(limit = 10) {
  try {
    const staff = await prisma.marketingStaff.findMany({
      where: {
        isApproved: true,
      },
      include: {
        _count: {
          select: {
            products: true,
            commissions: true,
          },
        },
      },
      orderBy: {
        totalSales: 'desc',
      },
      take: limit,
    });

    return staff.map((s) => ({
      id: s.id,
      name: s.name,
      totalSales: s.totalSales,
      totalCommission: s.totalCommission,
      commissionRate: s.commissionRate,
      productsCount: s._count.products,
      commissionsCount: s._count.commissions,
    }));
  } catch (error) {
    console.error('❌ خطأ في جلب أفضل الموظفين:', error);
    return [];
  }
}
