// API للموافقة السريعة على طلب التقسيط
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // التحقق من صلاحيات المدير
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    
    const { id } = params;
    
    // تحديث حالة الطلب إلى APPROVED
    const agreement = await prisma.installmentAgreement.update({
      where: { id },
      data: {
        status: 'APPROVED',
        verifiedBy: session.user.email || session.user.name || 'ADMIN',
        verifiedAt: new Date(),
        verificationNotes: 'تمت الموافقة من خلال النظام السريع'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    console.log(`✅ [APPROVED] طلب التقسيط ${agreement.agreementNumber} تمت الموافقة عليه`);
    console.log(`👤 العميل: ${agreement.fullName || agreement.user.name}`);
    console.log(`💰 المبلغ: ${agreement.totalAmount} ج.م`);
    
    // TODO: إرسال إشعار للعميل (email/SMS)
    
    return NextResponse.json({
      success: true,
      message: 'تمت الموافقة على الطلب بنجاح',
      agreement: {
        id: agreement.id,
        agreementNumber: agreement.agreementNumber,
        status: agreement.status
      }
    });
    
  } catch (error) {
    console.error('[API] خطأ في الموافقة على الطلب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الموافقة على الطلب' },
      { status: 500 }
    );
  }
}
