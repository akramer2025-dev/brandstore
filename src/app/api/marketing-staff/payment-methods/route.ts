import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// تحديث طرق الدفع لموظف التسويق
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // التحقق من أن المستخدم موظف تسويق
    if (session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const body = await request.json();
    const {
      // بيانات البنك
      bankName,
      accountNumber,
      accountHolderName,
      iban,
      // المحافظ الإلكترونية
      instaPay,
      etisalatCash,
      vodafoneCash,
      wePay,
    } = body;

    // البحث عن موظف التسويق
    const staff = await prisma.marketingStaff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return NextResponse.json({ 
        error: 'الحساب غير موجود' 
      }, { status: 404 });
    }

    // تحديث بيانات الدفع
    const updatedStaff = await prisma.marketingStaff.update({
      where: { id: staff.id },
      data: {
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        accountHolderName: accountHolderName || undefined,
        iban: iban || undefined,
        instaPay: instaPay || undefined,
        etisalatCash: etisalatCash || undefined,
        vodafoneCash: vodafoneCash || undefined,
        wePay: wePay || undefined,
      },
    });

    console.log('✅ تم تحديث طرق الدفع لموظف:', updatedStaff.id);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث طرق الدفع بنجاح',
      staff: updatedStaff,
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث طرق الدفع:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في التحديث' 
    }, { status: 500 });
  }
}
