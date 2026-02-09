import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// التحقق من تفعيل الإشعارات للمستخدم الحالي
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ enabled: false }, { status: 401 });
    }

    // البحث عن أي subscription نشط للمستخدم
    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        endpoint: true,
        lastUsedAt: true
      }
    });

    return NextResponse.json({
      enabled: !!subscription,
      subscription: subscription ? {
        id: subscription.id,
        lastUsedAt: subscription.lastUsedAt
      } : null
    });
  } catch (error) {
    console.error('❌ Error checking notification status:', error);
    return NextResponse.json(
      { error: 'فشل التحقق من حالة الإشعارات', enabled: false },
      { status: 500 }
    );
  }
}
