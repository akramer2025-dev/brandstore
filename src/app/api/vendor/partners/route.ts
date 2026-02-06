import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب جميع الشركاء
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب معلومات الشريك
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'الشريك غير موجود' }, { status: 404 });
    }

    // جلب جميع الشركاء
    const partners = await prisma.partnerCapital.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ partners });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الشركاء' },
      { status: 500 }
    );
  }
}

// POST - إضافة شريك جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'الشريك غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const {
      partnerName,
      email,
      phone,
      capitalAmount,
      capitalPercent,
      partnerType = 'PARTNER',
      notes,
      createUserAccount = false,
    } = body;

    // التحقق من البيانات المطلوبة
    if (!partnerName || !capitalAmount || !capitalPercent) {
      return NextResponse.json(
        { error: 'الاسم والمبلغ والنسبة مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من أن المبلغ والنسبة أرقام صحيحة
    const parsedCapitalAmount = parseFloat(capitalAmount);
    const parsedCapitalPercent = parseFloat(capitalPercent);

    if (isNaN(parsedCapitalAmount) || parsedCapitalAmount < 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون رقم موجب أو صفر' },
        { status: 400 }
      );
    }

    if (isNaN(parsedCapitalPercent) || parsedCapitalPercent < 0 || parsedCapitalPercent > 100) {
      return NextResponse.json(
        { error: 'النسبة يجب أن تكون رقم بين 0 و 100' },
        { status: 400 }
      );
    }

    let userId = null;

    // إنشاء حساب مستخدم للشريك إذا كان مطلوباً
    if (createUserAccount && email) {
      // التحقق من عدم وجود المستخدم
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        );
      }

      // إنشاء كلمة مرور عشوائية
      const bcrypt = require('bcryptjs');
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // إنشاء المستخدم
      const user = await prisma.user.create({
        data: {
          name: partnerName,
          email,
          phone,
          password: hashedPassword,
          role: 'VENDOR', // الشريك له نفس صلاحيات الشريك
        },
      });

      userId = user.id;

      // TODO: إرسال بريد إلكتروني بكلمة المرور
      console.log(`Password for ${email}: ${randomPassword}`);
    }

    // إنشاء سجل الشريك
    const partner = await prisma.partnerCapital.create({
      data: {
        vendorId: vendor.id,
        partnerName,
        partnerType,
        capitalAmount: parsedCapitalAmount,
        initialAmount: parsedCapitalAmount,
        currentAmount: parsedCapitalAmount,
        capitalPercent: parsedCapitalPercent,
        notes,
      },
    });

    // تحديث رأس مال الشريك
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        capitalBalance: {
          increment: parsedCapitalAmount,
        },
      },
    });

    // إنشاء معاملة إيداع
    await prisma.capitalTransaction.create({
      data: {
        vendorId: vendor.id,
        partnerId: partner.id,
        type: 'DEPOSIT',
        amount: parsedCapitalAmount,
        balanceBefore: vendor.capitalBalance,
        balanceAfter: vendor.capitalBalance + parsedCapitalAmount,
        description: `إيداع رأس مال من الشريك: ${partnerName}`,
        descriptionAr: `إيداع رأس مال من الشريك: ${partnerName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الشريك بنجاح',
      partner,
    });
  } catch (error) {
    console.error('Error adding partner:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الشريك' },
      { status: 500 }
    );
  }
}
