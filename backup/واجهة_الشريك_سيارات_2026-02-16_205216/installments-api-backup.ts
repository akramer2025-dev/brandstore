import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب جميع الاتفاقيات (Admin only)
export async function GET(request: Request) {
  try {
    console.log('🔍 [Installments API] بدء جلب الاتفاقيات...');
    
    const session = await getServerSession(authOptions);
    console.log('👤 [Installments API] Session:', session?.user?.email || 'No session');

    if (!session?.user) {
      console.warn('⚠️ [Installments API] محاولة وصول بدون تسجيل دخول');
      return NextResponse.json(
        { error: 'غير مصرح لك بالدخول' },
        { status: 401 }
      );
    }

    // التحقق من صلاحيات Admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true }
    });
    console.log('🔐 [Installments API] المستخدم:', user?.email, '- الصلاحية:', user?.role);

    if (user?.role !== 'ADMIN' && user?.role !== 'DEVELOPER') {
      console.warn('⚠️ [Installments API] محاولة وصول بدون صلاحيات كافية');
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    // جلب جميع الاتفاقيات مع بيانات المستخدم والطلب
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log('📊 [Installments API] معاملات البحث:', { status, page, limit });

    const where: any = {};
    if (status) {
      where.status = status;
    }

    console.log('🔎 [Installments API] جاري الاستعلام من قاعدة البيانات...');
    
    const [agreements, total] = await Promise.all([
      prisma.installmentAgreement.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.installmentAgreement.count({ where })
    ]);

    console.log(`✅ [Installments API] تم جلب ${agreements.length} اتفاقية من أصل ${total}`);

    return NextResponse.json({
      success: true,
      agreements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [Installments API] Error fetching installments:', error);
    console.error('📋 [Installments API] Stack trace:', (error as Error).stack);
    console.error('📄 [Installments API] Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      cause: (error as any).cause
    });
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ في جلب الاتفاقيات',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
