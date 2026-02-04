import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Toggle delivery zone active status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح - صلاحيات إدارية مطلوبة' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const zone = await prisma.deliveryZone.findUnique({
      where: { id }
    });

    if (!zone) {
      return NextResponse.json(
        { message: 'منطقة التوصيل غير موجودة' },
        { status: 404 }
      );
    }

    // Toggle isActive
    const updated = await prisma.deliveryZone.update({
      where: { id },
      data: {
        isActive: !zone.isActive
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error toggling delivery zone:', error);
    return NextResponse.json(
      { message: 'فشل في تحديث حالة المنطقة' },
      { status: 500 }
    );
  }
}
