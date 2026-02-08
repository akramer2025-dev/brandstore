import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب المصروفات
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'حساب الشريك غير موجود' }, { status: 404 });
    }

    const expenses = await prisma.vendorExpense.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    // حساب الإحصائيات
    const stats = expenses.reduce((acc, expense) => ({
      total: acc.total + expense.amount,
      count: acc.count + 1,
    }), { total: 0, count: 0 });

    return NextResponse.json({ expenses, stats });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

// POST - إضافة مصروف جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, capitalBalance: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'حساب الشريك غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const { amount, category, description, notes } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ 
        error: 'المبلغ يجب أن يكون أكبر من صفر' 
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: 'نوع المصروف مطلوب' 
      }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

    // التحقق من رصيد رأس المال
    if (vendor.capitalBalance < parsedAmount) {
      return NextResponse.json({ 
        error: `رأس المال غير كافٍ. الرصيد الحالي: ${vendor.capitalBalance.toFixed(2)} جنيه` 
      }, { status: 400 });
    }

    // إنشاء المصروف وتحديث رأس المال في transaction
    const result = await prisma.$transaction(async (tx) => {
      // إنشاء المصروف
      const expense = await tx.vendorExpense.create({
        data: {
          vendorId: vendor.id,
          amount: parsedAmount,
          category,
          description: description || `مصروف - ${category}`,
          notes: notes || null,
          createdBy: session.user.name || session.user.email || 'Unknown',
        },
      });

      // خصم من رأس المال
      const updatedVendor = await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: {
            decrement: parsedAmount,
          },
        },
      });

      // تسجيل المعاملة
      await tx.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'EXPENSE',
          amount: parsedAmount,
          balanceBefore: vendor.capitalBalance,
          balanceAfter: updatedVendor.capitalBalance,
          description: `مصروف - ${category}`,
          descriptionAr: `مصروف - ${category}${description ? ': ' + description : ''}`,
          notes: notes || null,
        },
      });

      return { expense, newBalance: updatedVendor.capitalBalance };
    });

    return NextResponse.json({ 
      success: true,
      expense: result.expense,
      newBalance: result.newBalance,
      message: 'تم تسجيل المصروف بنجاح',
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل المصروف' },
      { status: 500 }
    );
  }
}
