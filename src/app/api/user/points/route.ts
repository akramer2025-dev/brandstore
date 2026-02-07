import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // جلب معلومات المستخدم مع النقاط
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        points: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // جلب آخر 10 عمليات
    const transactions = await prisma.pointTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      points: user.points,
      transactions,
      pointValue: 1, // كل نقطة = 1 جنيه
    });
  } catch (error) {
    console.error('❌ خطأ في جلب النقاط:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب النقاط' }, { status: 500 });
  }
}
