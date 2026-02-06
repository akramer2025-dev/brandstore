import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = session.user.role;
    const userId = session.user.id;

    // فلترة حسب الدور
    let whereClause: any = {};

    if (role === 'VENDOR') {
      // الشريك يرى فقط طلباته المرفوضة
      whereClause.vendorId = userId;
    } else if (role === 'ADMIN') {
      // الأدمن يرى طلباته المرفوضة كشريك (إذا كان شريك أيضاً)
      const vendor = await prisma.vendor.findUnique({
        where: { userId }
      });
      if (vendor) {
        whereClause.vendorId = vendor.id;
      } else {
        // إذا لم يكن شريك، يرى كل الطلبات المرفوضة
        whereClause = {};
      }
    } else if (role === 'DEVELOPER') {
      // المطور يرى كل الطلبات المرفوضة
      whereClause = {};
    } else {
      return NextResponse.json({ error: 'غير مصرح لك بعرض التقارير' }, { status: 403 });
    }

    // فلاتر إضافية من query params
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vendorId = searchParams.get('vendorId');

    if (startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(endDate)
      };
    }

    // المطور والأدمن يمكنهم الفلترة حسب الشريك
    if ((role === 'DEVELOPER' || role === 'ADMIN') && vendorId) {
      whereClause.vendorId = vendorId;
    }

    // الحصول على الطلبات المرفوضة
    const rejectedOrders = await prisma.orderRejectionLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 100, // الحد الأقصى 100 طلب
    });

    // حساب الإحصائيات
    const totalRejected = rejectedOrders.length;
    const totalValue = rejectedOrders.reduce((sum, order) => sum + order.orderValue, 0);

    // تجميع حسب سبب الرفض
    const reasonsCount = rejectedOrders.reduce((acc: any, order) => {
      const reason = order.rejectionReason || 'غير محدد';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    // تجميع حسب الشريك (للمطور والأدمن فقط)
    let vendorStats = null;
    if (role === 'DEVELOPER' || role === 'ADMIN') {
      vendorStats = rejectedOrders.reduce((acc: any, order) => {
        const vendorId = order.vendorId || 'بدون شريك';
        if (!acc[vendorId]) {
          acc[vendorId] = {
            count: 0,
            totalValue: 0
          };
        }
        acc[vendorId].count++;
        acc[vendorId].totalValue += order.orderValue;
        return acc;
      }, {});
    }

    return NextResponse.json({
      success: true,
      data: {
        rejectedOrders,
        statistics: {
          totalRejected,
          totalValue,
          reasonsCount,
          vendorStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching rejected orders report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقرير' },
      { status: 500 }
    );
  }
}
