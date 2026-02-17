import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب اتفاقية واحدة بالتفصيل
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالدخول' },
        { status: 401 }
      );
    }

    // التحقق من صلاحيات Admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const agreement = await prisma.installmentAgreement.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!agreement) {
      return NextResponse.json(
        { error: 'الاتفاقية غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agreement
    });
  } catch (error) {
    console.error('Error fetching agreement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الاتفاقية' },
      { status: 500 }
    );
  }
}

// PATCH - تحديث حالة الاتفاقية
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالدخول' },
        { status: 401 }
      );
    }

    // التحقق من صلاحيات Admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, verificationNotes, rejectionReason } = body;

    // Validate status
    const validStatuses = [
      'PENDING',
      'DOCUMENTS_COMPLETE',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'EXPIRED'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'حالة غير صحيحة' },
        { status: 400 }
      );
    }

    // إذا كانت الحالة مرفوضة، يجب إدخال سبب الرفض
    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { error: 'يجب إدخال سبب الرفض' },
        { status: 400 }
      );
    }

    // تحديث الاتفاقية
    const updatedAgreement = await prisma.installmentAgreement.update({
      where: { id: params.id },
      data: {
        status,
        verificationNotes,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        verifiedBy: user.name || session.user.email,
        verifiedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // TODO: إرسال إشعار للعميل
    // يمكن إضافة notification أو email هنا

    return NextResponse.json({
      success: true,
      agreement: updatedAgreement,
      message: 'تم تحديث حالة الاتفاقية بنجاح'
    });
  } catch (error) {
    console.error('Error updating agreement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الاتفاقية' },
      { status: 500 }
    );
  }
}
