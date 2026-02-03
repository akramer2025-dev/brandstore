import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'الحالة مطلوبة' },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    
    // If completing, set completedAt
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const production = await prisma.production.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ production });

  } catch (error) {
    console.error('Error updating production:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث أمر الإنتاج' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;

    const production = await prisma.production.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            nameAr: true,
            name: true
          }
        }
      }
    });

    if (!production) {
      return NextResponse.json(
        { error: 'أمر الإنتاج غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ production });

  } catch (error) {
    console.error('Error fetching production:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب أمر الإنتاج' },
      { status: 500 }
    );
  }
}
