import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// تحديد العمولة كمدفوعة
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // فقط الـ admin يستطيع دفع العمولات
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const body = await request.json();
    const { commissionId, paymentMethod, paymentReference } = body;

    if (!commissionId) {
      return NextResponse.json({ error: 'رقم العمولة مطلوب' }, { status: 400 });
    }

    // جلب العمولة
    const commission = await prisma.marketingCommission.findUnique({
      where: { id: commissionId },
      include: {
        marketingStaff: true,
      },
    });

    if (!commission) {
      return NextResponse.json({ error: 'العمولة غير موجودة' }, { status: 404 });
    }

    if (commission.isPaid) {
      return NextResponse.json({ 
        error: 'العمولة مدفوعة بالفعل' 
      }, { status: 400 });
    }

    // تحديث حالة الدفع
    const updatedCommission = await prisma.marketingCommission.update({
      where: { id: commissionId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
      include: {
        marketingStaff: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    console.log(`✅ تم دفع عمولة ${commission.commissionAmount} جنيه لـ ${commission.marketingStaff.name}`);

    return NextResponse.json({
      success: true,
      commission: updatedCommission,
      message: `تم تسجيل دفع عمولة ${commission.commissionAmount.toFixed(2)} جنيه`,
    });

  } catch (error) {
    console.error('❌ خطأ في تسجيل الدفع:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في تسجيل الدفع' 
    }, { status: 500 });
  }
}

// دفع جماعي للعمولات
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const body = await request.json();
    const { commissionIds, paymentMethod, paymentReference } = body;

    if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json({ error: 'يجب اختيار عمولة واحدة على الأقل' }, { status: 400 });
    }

    // تحديث كل العمولات
    const updated = await prisma.marketingCommission.updateMany({
      where: {
        id: { in: commissionIds },
        isPaid: false,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    // حساب المبلغ
    const commissions = await prisma.marketingCommission.findMany({
      where: { id: { in: commissionIds } },
      select: { commissionAmount: true },
    });

    const totalAmount = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    console.log(`✅ تم دفع ${updated.count} عمولة بإجمالي ${totalAmount} جنيه`);

    return NextResponse.json({
      success: true,
      count: updated.count,
      totalAmount,
      message: `تم تسجيل دفع ${updated.count} عمولة بإجمالي ${totalAmount.toFixed(2)} جنيه`,
    });

  } catch (error) {
    console.error('❌ خطأ في الدفع الجماعي:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في تسجيل المدفوعات' 
    }, { status: 500 });
  }
}
