import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// جلب رأس المال
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        initialCapital: true,
        capitalBalance: true,
      }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 });
    }

    return NextResponse.json({ 
      initialCapital: vendor.initialCapital || 7500,
      capitalBalance: vendor.capitalBalance || 7500
    });

  } catch (error) {
    console.error('Error fetching capital:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

// تسجيل رأس المال
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 });
    }

    const { initialAmount, notes } = await req.json();

    if (!initialAmount || initialAmount <= 0) {
      return NextResponse.json({ error: 'المبلغ غير صحيح' }, { status: 400 });
    }

    // إنشاء سجل رأس المال
    const result = await prisma.$transaction(async (tx) => {
      // إنشاء سجل رأس المال
      const capital = await tx.partnerCapital.create({
        data: {
          vendorId: vendor.id,
          partnerName: session.user.name || 'الشريك',
          partnerType: 'OWNER',
          capitalAmount: parseFloat(initialAmount),
          initialAmount: parseFloat(initialAmount),
          currentAmount: parseFloat(initialAmount),
          capitalPercent: 100, // 100% لأنه المالك
          notes: notes || null,
        }
      });

      // تحديث رصيد رأس المال في جدول الشريك
      const balanceBefore = vendor.capitalBalance || 0;
      const balanceAfter = balanceBefore + parseFloat(initialAmount);
      
      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: {
            increment: parseFloat(initialAmount)
          }
        }
      });

      // تسجيل المعاملة
      await tx.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'DEPOSIT',
          amount: parseFloat(initialAmount),
          description: 'إيداع رأس المال',
          descriptionAr: notes || 'إيداع رأس المال الأساسي',
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
        }
      });

      return capital;
    });

    return NextResponse.json({
      message: 'تم تسجيل رأس المال بنجاح',
      capital: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating capital:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الحفظ' },
      { status: 500 }
    );
  }
}

// تحديث رأس المال
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      include: {
        partners: {
          where: { partnerType: 'OWNER' },
          take: 1
        }
      }
    });

    if (!vendor || !vendor.partners[0]) {
      return NextResponse.json({ error: 'لم يتم العثور على رأس المال' }, { status: 404 });
    }

    const { initialAmount, notes } = await req.json();

    if (!initialAmount || initialAmount <= 0) {
      return NextResponse.json({ error: 'المبلغ غير صحيح' }, { status: 400 });
    }

    const currentCapital = vendor.partners[0];
    const difference = parseFloat(initialAmount) - currentCapital.initialAmount;

    // تحديث رأس المال
    const updated = await prisma.partnerCapital.update({
      where: { id: currentCapital.id },
      data: {
        initialAmount: parseFloat(initialAmount),
        currentAmount: currentCapital.currentAmount + difference,
        notes: notes || null,
      }
    });

    return NextResponse.json({
      message: 'تم تحديث رأس المال بنجاح',
      capital: updated
    });

  } catch (error) {
    console.error('Error updating capital:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحديث' },
      { status: 500 }
    );
  }
}
