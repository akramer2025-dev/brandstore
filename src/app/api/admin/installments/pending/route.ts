// API للحصول على طلبات التقسيط الجديدة (للإشعارات)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // التحقق من صلاحيات المدير
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get('since');
    
    let since: Date;
    if (sinceParam) {
      since = new Date(sinceParam);
    } else {
      // آخر 5 دقائق افتراضياً
      since = new Date(Date.now() - 5 * 60 * 1000);
    }
    
    // جلب الطلبات الجديدة
    const newRequests = await prisma.installmentAgreement.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          gte: since
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        agreementNumber: true,
        fullName: true,
        totalAmount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      take: 10
    });
    
    return NextResponse.json({
      success: true,
      newRequests: newRequests.map(req => ({
        id: req.id,
        agreementNumber: req.agreementNumber,
        fullName: req.fullName || req.user.name || 'غير محدد',
        totalAmount: req.totalAmount,
        createdAt: req.createdAt.toISOString(),
        userEmail: req.user.email,
        userPhone: req.user.phone
      })),
      count: newRequests.length
    });
    
  } catch (error) {
    console.error('[API] خطأ في جلب الطلبات الجديدة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}
