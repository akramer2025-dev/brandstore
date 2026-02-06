import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'الرمز وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // البحث عن الـ token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'رابط إعادة التعيين غير صالح' },
        { status: 400 }
      );
    }

    // التحقق من انتهاء صلاحية الـ token
    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(password, 10);

    // تحديث كلمة المرور
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // حذف الـ token
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول',
    });
  } catch (error: any) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تغيير كلمة المرور' },
      { status: 500 }
    );
  }
}
