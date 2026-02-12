import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/vendors/[id]/toggle-suspension - تعليق/تفعيل حساب شريك
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🚀 === TOGGLE SUSPENSION API CALLED ===');
  try {
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', { userId: session?.user?.id, role: session?.user?.role });
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { id: vendorId } = await params;
    const body = await req.json();
    const { suspend, reason } = body;
    
    console.log('🔧 Toggle Suspension Request:', {
      vendorId,
      suspend,
      reason,
      adminId: session.user.id
    });

    // الحصول على معلومات الشريك الحالية
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // تحديث حالة التعليق
    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        isSuspended: suspend,
        suspensionReason: suspend ? reason : null,
        suspendedAt: suspend ? new Date() : null,
        suspendedBy: suspend ? session.user.id : null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: suspend 
        ? `تم إيقاف حساب ${vendor.storeNameAr || vendor.user?.name || 'الشريك'} بنجاح`
        : `تم تفعيل حساب ${vendor.storeNameAr || vendor.user?.name || 'الشريك'} بنجاح`,
      vendor: {
        id: updated.id,
        storeNameAr: updated.storeNameAr,
        isSuspended: updated.isSuspended,
        suspensionReason: updated.suspensionReason,
        suspendedAt: updated.suspendedAt,
      },
    });
  } catch (error: any) {
    console.error('❌ Error toggling vendor suspension:', error);
    console.error('📋 Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    return NextResponse.json(
      { error: error.message || 'Failed to toggle suspension' },
      { status: 500 }
    );
  }
}
