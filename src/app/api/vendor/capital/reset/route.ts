import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// تصفية وإعادة تعيين رأس المال
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

    const { newAmount } = await req.json();
    
    const amount = Number(newAmount);

    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: 'المبلغ غير صحيح' }, { status: 400 });
    }

    // تصفية رأس المال في transaction
    await prisma.$transaction(async (tx) => {
      // حذف جميع المعاملات السابقة
      await tx.capitalTransaction.deleteMany({
        where: { vendorId: vendor.id }
      });

      // تعيين رأس المال الجديد
      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: amount,
        }
      });

      // إنشاء معاملة إيداع جديدة
      await tx.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'DEPOSIT',
          amount: amount,
          description: 'تصفية وإعادة تعيين رأس المال',
          descriptionAr: 'تصفية وإعادة تعيين رأس المال',
          balanceBefore: 0,
          balanceAfter: amount,
        }
      });
    });

    return NextResponse.json({ 
      message: 'تم تصفية رأس المال بنجاح',
      newBalance: amount
    });

  } catch (error) {
    console.error('Error resetting capital:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تصفية رأس المال' },
      { status: 500 }
    );
  }
}
