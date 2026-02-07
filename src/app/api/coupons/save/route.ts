import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await request.json();
    const { discount, minPurchase, percentage } = body;

    // التحقق من البيانات
    if (!discount || !minPurchase) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    // إنشاء كود الخصم
    const code = `LUCKY${discount}${Date.now().toString().slice(-4)}`;
    
    // تاريخ الانتهاء بعد 7 أيام
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // حفظ الكوبون في قاعدة البيانات
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discount: parseFloat(discount),
        minPurchase: parseFloat(minPurchase),
        discountType: 'FIXED',
        isActive: true,
        expiresAt,
        maxUses: 1, // استخدام واحد فقط
        usedCount: 0,
        userId: session.user.id, // ربط بالمستخدم
      },
    });

    console.log('✅ تم إنشاء كوبون جديد:', {
      code: coupon.code,
      discount: coupon.discount,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الخصم بنجاح',
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        minPurchase: coupon.minPurchase,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في حفظ الكوبون:', error);
    
    // تفاصيل أكثر عن الخطأ للتشخيص
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
    console.error('تفاصيل الخطأ:', errorMessage);
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ في حفظ الخصم',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
