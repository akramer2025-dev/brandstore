import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// إنشاء حساب موظف تسويق
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // التحقق من أن المستخدم admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, name, phone, email, commissionRate = 5 } = body;

    if (!userId || !name || !phone) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // التحقق من عدم وجود موظف تسويق بنفس الرقم
    const existingStaff = await prisma.marketingStaff.findFirst({
      where: {
        OR: [
          { phone },
          { userId },
        ],
      },
    });

    if (existingStaff) {
      return NextResponse.json({ 
        error: 'موظف التسويق مسجل بالفعل' 
      }, { status: 400 });
    }

    // تحديث دور المستخدم إلى MARKETING_STAFF
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'MARKETING_STAFF' },
    });

    // إنشاء موظف التسويق
    const marketingStaff = await prisma.marketingStaff.create({
      data: {
        userId,
        name,
        phone,
        email,
        commissionRate: parseFloat(commissionRate.toString()),
        isApproved: true, // يمكن تغييره للمراجعة اليدوية
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

    console.log('✅ تم إنشاء موظف تسويق:', marketingStaff.id);

    return NextResponse.json({
      success: true,
      marketingStaff,
      message: 'تم إنشاء حساب موظف التسويق بنجاح',
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء موظف التسويق:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في إنشاء الحساب' 
    }, { status: 500 });
  }
}

// جلب موظفي التسويق (للـ admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // إذا كان موظف تسويق، أرجع بياناته فقط
    if (session.user.role === 'MARKETING_STAFF') {
      const staff = await prisma.marketingStaff.findUnique({
        where: { userId: session.user.id },
        include: {
          products: {
            select: {
              id: true,
              nameAr: true,
              price: true,
              stock: true,
              soldCount: true,
            },
          },
          commissions: {
            where: { isPaid: false },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!staff) {
        return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 });
      }

      return NextResponse.json({ staff });
    }

    // للـ admin، أرجع كل الموظفين
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const staffList = await prisma.marketingStaff.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            commissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ staffList });

  } catch (error) {
    console.error('❌ خطأ في جلب موظفي التسويق:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في جلب البيانات' 
    }, { status: 500 });
  }
}
