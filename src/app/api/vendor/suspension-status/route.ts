import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/vendor/suspension-status - فحص حالة التعليق
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        storeNameAr: true,
        storeName: true,
        isSuspended: true,
        suspensionReason: true,
        suspendedAt: true,
        whatsapp: true,
        phone: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isSuspended: vendor.isSuspended,
      storeNameAr: vendor.storeNameAr,
      storeName: vendor.storeName,
      suspensionReason: vendor.suspensionReason,
      suspendedAt: vendor.suspendedAt,
      whatsapp: vendor.whatsapp,
      phone: vendor.phone,
    });
  } catch (error: any) {
    console.error('Error checking suspension status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
