import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - إضافة سند قبض/صرف
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        capitalBalance: true,
      },
    });

    if (!vendor || !vendor.canAddOfflineProducts) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { type, amount, paymentMethod = 'CASH', notes } = body;

    // التحقق من البيانات
    if (!type || !['RECEIPT', 'PAYMENT'].includes(type)) {
      return NextResponse.json({ 
        error: 'نوع السند مطلوب (قبض أو صرف)' 
      }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'المبلغ يجب أن يكون أكبر من صفر' 
      }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

    // التحقق من وجود الوسيط
    const supplier = await prisma.offlineSupplier.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
      },
    });

    if (!supplier) {
      return NextResponse.json({ 
        error: 'الوسيط غير موجود' 
      }, { status: 404 });
    }

    // إنشاء السند
    const payment = await prisma.offlineSupplierPayment.create({
      data: {
        vendorId: vendor.id,
        supplierId: params.id,
        type,
        amount: parsedAmount,
        paymentMethod,
        notes: notes || null,
        paidBy: session.user.name || session.user.email || 'Unknown',
      },
    });

    // تحديث رأس المال
    let updatedVendor;
    if (type === 'RECEIPT') {
      // سند قبض: زيادة رأس المال (الوسيط دفع للشريك)
      updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: {
            increment: parsedAmount,
          },
        },
      });

      // تسجيل المعاملة
      await prisma.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'RECEIPT_FROM_SUPPLIER',
          amount: parsedAmount,
          balanceBefore: vendor.capitalBalance,
          balanceAfter: updatedVendor.capitalBalance,
          description: `سند قبض من ${supplier.name}`,
          descriptionAr: `سند قبض من ${supplier.name} - ${parsedAmount} ج`,
        },
      });
    } else {
      // سند صرف: تقليل رأس المال (الشريك دفع للوسيط)
      if (vendor.capitalBalance < parsedAmount) {
        // حذف السند لأن العملية فشلت
        await prisma.offlineSupplierPayment.delete({
          where: { id: payment.id },
        });
        
        return NextResponse.json({ 
          error: `رأس المال غير كافٍ. الرصيد الحالي: ${vendor.capitalBalance.toFixed(2)} جنيه` 
        }, { status: 400 });
      }

      updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: {
            decrement: parsedAmount,
          },
        },
      });

      // تسجيل المعاملة
      await prisma.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'PAYMENT_TO_SUPPLIER',
          amount: parsedAmount,
          balanceBefore: vendor.capitalBalance,
          balanceAfter: updatedVendor.capitalBalance,
          description: `سند صرف إلى ${supplier.name}`,
          descriptionAr: `سند صرف إلى ${supplier.name} - ${parsedAmount} ج`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: type === 'RECEIPT' ? 'تم إضافة سند القبض بنجاح' : 'تم إضافة سند الصرف بنجاح',
      data: {
        payment,
        newCapitalBalance: updatedVendor.capitalBalance,
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة السند' },
      { status: 500 }
    );
  }
}

// GET - جلب سندات وسيط معين
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, canAddOfflineProducts: true },
    });

    if (!vendor || !vendor.canAddOfflineProducts) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const payments = await prisma.offlineSupplierPayment.findMany({
      where: {
        vendorId: vendor.id,
        supplierId: params.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب السندات' },
      { status: 500 }
    );
  }
}
