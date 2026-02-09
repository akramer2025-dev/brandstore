import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - مسح كل البيانات والبدء من جديد
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true, 
        canAddOfflineProducts: true,
      },
    });

    if (!vendor || !vendor.canAddOfflineProducts) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // حساب المبالغ المسترجعة
    const products = await prisma.offlineProduct.findMany({
      where: { vendorId: vendor.id },
    });

    const totalRefund = products.reduce((sum, p) => {
      // استرجاع تكلفة القطع التي لم تُباع
      const remainingQuantity = p.quantity - p.soldQuantity;
      return sum + (p.purchasePrice * remainingQuantity);
    }, 0);

    // مسح كل المدفوعات للموردين
    await prisma.offlineSupplierPayment.deleteMany({
      where: {
        supplier: {
          vendorId: vendor.id,
        },
      },
    });

    // مسح كل البضائع
    await prisma.offlineProduct.deleteMany({
      where: { vendorId: vendor.id },
    });

    // مسح كل الموردين
    await prisma.offlineSupplier.deleteMany({
      where: { vendorId: vendor.id },
    });

    // إرجاع المبلغ لرأس المال إذا كان هناك استرجاع
    let updatedVendor = vendor;
    if (totalRefund > 0) {
      const currentVendor = await prisma.vendor.findUnique({
        where: { id: vendor.id },
        select: { capitalBalance: true },
      });

      updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: {
            increment: totalRefund,
          },
        },
      });

      // تسجيل المعاملة
      await prisma.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'DEPOSIT',
          amount: totalRefund,
          balanceBefore: currentVendor?.capitalBalance || 0,
          balanceAfter: updatedVendor.capitalBalance,
          description: `مسح جميع البضائع والبدء من جديد - استرجاع ${totalRefund.toFixed(0)} ج`,
          descriptionAr: `مسح جميع البضائع والبدء من جديد - استرجاع ${totalRefund.toFixed(0)} ج`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم مسح جميع البيانات بنجاح',
      refundedAmount: totalRefund,
      newBalance: updatedVendor.capitalBalance || 0,
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء مسح البيانات' },
      { status: 500 }
    );
  }
}
