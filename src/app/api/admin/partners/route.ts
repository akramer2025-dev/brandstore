import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب جميع الشركاء (للمدير فقط)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب جميع الشركاء من جميع الـ vendors
    const partners = await prisma.partnerCapital.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
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

// POST - إضافة شريك جديد (للمدير فقط)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
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
    if (!partnerName || !email || !capitalAmount || !capitalPercent) {
      return NextResponse.json(
        { error: 'الاسم، البريد، المبلغ والنسبة مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة النسبة
    if (capitalPercent < 0 || capitalPercent > 100) {
      return NextResponse.json(
        { error: 'النسبة يجب أن تكون بين 0 و 100' },
        { status: 400 }
      );
    }

    let vendorId = null;
    let userId = null;

    // إنشاء حساب مستخدم وvendor للشريك إذا كان مطلوباً
    if (createUserAccount) {
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

      // استخدام كلمة المرور المدخلة
      const bcrypt = require('bcryptjs');
      const password = body.password || Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      // إنشاء المستخدم
      const user = await prisma.user.create({
        data: {
          name: partnerName,
          email,
          phone,
          password: hashedPassword,
          role: 'VENDOR', // الشريك له دور VENDOR
        },
      });

      userId = user.id;

      // إنشاء حساب vendor
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          phone: phone || '',
          address: '',
          capitalBalance: parseFloat(capitalAmount),
          isApproved: true,
        },
      });

      vendorId = vendor.id;

      // TODO: إرسال بريد إلكتروني بكلمة المرور
      console.log(`✅ تم إنشاء حساب للشريك:`);
      console.log(`   البريد: ${email}`);
      console.log(`   كلمة المرور: ${password}`);
    } else {
      // إنشاء vendor مؤقت بدون user (لحالة الشركاء الذين لا يحتاجون حساب)
      // سنحتاج vendor لربط PartnerCapital
      // يمكن إنشاء vendor مرتبط بالمدير نفسه أو vendor خاص
      const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!adminUser) {
        return NextResponse.json({ error: 'المدير غير موجود' }, { status: 404 });
      }

      // البحث عن vendor المدير أو إنشاء واحد
      let adminVendor = await prisma.vendor.findUnique({
        where: { userId: adminUser.id },
      });

      if (!adminVendor) {
        adminVendor = await prisma.vendor.create({
          data: {
            userId: adminUser.id,
            phone: adminUser.phone || '',
            address: '',
            capitalBalance: 0,
            isApproved: true,
          },
        });
      }

      vendorId = adminVendor.id;
    }

    // حساب نسبة المساهمة الفعلية بناءً على رأس المال الكلي
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { capitalBalance: true },
    });

    const currentTotalCapital = vendor?.capitalBalance || 0;
    const newTotalCapital = currentTotalCapital + parseFloat(capitalAmount);
    const actualPercent = (parseFloat(capitalAmount) / newTotalCapital) * 100;

    // استخدام النسبة المحسوبة تلقائياً أو المُدخلة (أيهما أدق)
    const finalPercent = actualPercent;

    console.log('📊 حساب نسبة المساهمة:');
    console.log(`   رأس المال الحالي: ${currentTotalCapital} جنيه`);
    console.log(`   مساهمة الشريك: ${parseFloat(capitalAmount)} جنيه`);
    console.log(`   رأس المال الجديد: ${newTotalCapital} جنيه`);
    console.log(`   النسبة المُدخلة: ${parseFloat(capitalPercent)}%`);
    console.log(`   النسبة المحسوبة: ${actualPercent.toFixed(2)}%`);

    // إنشاء سجل الشريك
    const partner = await prisma.partnerCapital.create({
      data: {
        vendorId,
        partnerName,
        partnerType,
        capitalAmount: parseFloat(capitalAmount),
        initialAmount: parseFloat(capitalAmount),
        currentAmount: parseFloat(capitalAmount),
        capitalPercent: finalPercent,
        notes,
      },
    });

    // تحديث رأس مال الـ vendor
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        capitalBalance: {
          increment: parseFloat(capitalAmount),
        },
      },
    });

    // إنشاء معاملة إيداع
    await prisma.capitalTransaction.create({
      data: {
        vendorId,
        partnerId: partner.id,
        type: 'DEPOSIT',
        amount: parseFloat(capitalAmount),
        balanceBefore: 0,
        balanceAfter: parseFloat(capitalAmount),
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
