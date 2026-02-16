// API لرفض طلب التقسيط
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
    const body = await req.json();
    const { reason } = body;
    
    // تحديث حالة الطلب إلى REJECTED
    const agreement = await prisma.installmentAgreement.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'لم يتم توضيح السبب',
        verifiedBy: session.user.email || session.user.name || 'ADMIN',
        verifiedAt: new Date(),
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
    
    console.log(`❌ [REJECTED] طلب التقسيط ${agreement.agreementNumber} تم رفضه`);
    console.log(`👤 العميل: ${agreement.fullName || agreement.user.name}`);
    console.log(`📝 السبب: ${reason || 'لم يحدد'}`);
    
    // TODO: إرسال إشعار للعميل (email/SMS) مع سبب الرفض
    
    return NextResponse.json({
      success: true,
      message: 'تم رفض الطلب',
      agreement: {
        id: agreement.id,
        agreementNumber: agreement.agreementNumber,
        status: agreement.status,
        rejectionReason: agreement.rejectionReason
      }
    });
    
  } catch (error) {
    console.error('[API] خطأ في رفض الطلب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفض الطلب' },
      { status: 500 }
    );
  }
}
