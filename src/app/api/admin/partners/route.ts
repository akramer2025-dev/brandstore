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

    console.log('📊 جلب جميع الشركاء للمدير...');

    // جلب جميع الشركاء من جميع الـ vendors
    const partners = await prisma.partnerCapital.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: {
            id: true,
            userId: true,
            user: true,
          },
        },
      },
    });

    console.log(`✅ تم جلب ${partners.length} شريك من قاعدة البيانات`);

    // تنسيق البيانات لتجنب مشاكل null
    const formattedPartners = partners.map(partner => ({
      ...partner,
      vendor: partner.vendor ? {
        id: partner.vendor.id,
        userId: partner.vendor.userId,
        user: partner.vendor.user ? {
          id: partner.vendor.user.id,
          name: partner.vendor.user.name,
          email: partner.vendor.user.email,
        } : null,
      } : null,
    }));

    return NextResponse.json({ partners: formattedPartners });
  } catch (error) {
    console.error('❌ Error fetching partners:', error);
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
      password,
      capitalAmount,
      capitalPercent,
      partnerType = 'PARTNER',
      notes,
      createUserAccount = false,
      canDeleteOrders = false,
    } = body;

    console.log('📝 محاولة إضافة شريك جديد:', { partnerName, email, createUserAccount });

    // التحقق من البيانات المطلوبة (البريد إجباري دائماً)
    if (!partnerName || !email || !capitalAmount || !capitalPercent) {
      console.log('❌ بيانات ناقصة');
      return NextResponse.json(
        { error: 'الاسم، البريد الإلكتروني، المبلغ والنسبة مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من كلمة المرور إذا كان سيتم إنشاء حساب
    if (createUserAccount && !password) {
      return NextResponse.json(
        { error: 'كلمة المرور مطلوبة عند إنشاء حساب' },
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

    // التحقق من البريد إذا كان سيتم إنشاء حساب
    if (createUserAccount) {
      console.log('🔍 التحقق من البريد:', email);
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          vendor: {
            include: {
              partners: true,
            },
          },
        },
      });

      if (existingUser) {
        console.log('❌ البريد مستخدم بالفعل:', email);
        
        let errorMessage = `البريد الإلكتروني "${email}" مستخدم بالفعل في النظام`;
        
        if (existingUser.role === 'CUSTOMER') {
          errorMessage += ' كحساب عميل';
        } else if (existingUser.role === 'VENDOR') {
          errorMessage += ' كحساب بائع/شريك';
        } else if (existingUser.role === 'ADMIN') {
          errorMessage += ' كحساب مدير';
        }
        
        errorMessage += ` (الاسم: ${existingUser.name})`;
        
        return NextResponse.json(
          { 
            error: errorMessage,
            existingUser: {
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
            }
          },
          { status: 400 }
        );
      }

      console.log('✅ البريد متاح');
    }

    let vendorId: string;
    let userPassword: string | null = null;

    // استخدام Transaction لضمان تنفيذ جميع العمليات معاً
    const result = await prisma.$transaction(async (tx) => {
      let createdVendorId: string;

      // إنشاء حساب مستخدم وvendor للشريك إذا كان مطلوباً
      if (createUserAccount) {
        // استخدام كلمة المرور المدخلة أو إنشاء واحدة عشوائية
        const bcrypt = require('bcryptjs');
        userPassword = password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        console.log('👤 إنشاء حساب مستخدم...');

        // إنشاء المستخدم
        const user = await tx.user.create({
          data: {
            name: partnerName,
            email,
            phone,
            password: hashedPassword,
            role: 'VENDOR',
          },
        });

        console.log('✅ تم إنشاء المستخدم:', user.id);

        // إنشاء حساب vendor
        const vendor = await tx.vendor.create({
          data: {
            userId: user.id,
            phone: phone || '',
            address: '',
            capitalBalance: 0,
            isApproved: true,
            canDeleteOrders: canDeleteOrders,
          },
        });

        createdVendorId = vendor.id;
        console.log('✅ تم إنشاء Vendor:', vendor.id);
        console.log(`✅ تم إنشاء حساب للشريك - البريد: ${email}`);
      } else {
        console.log('📌 إنشاء شريك بدون حساب مستخدم');
        
        const adminUser = await tx.user.findUnique({
          where: { id: session.user.id },
        });

        if (!adminUser) {
          throw new Error('المدير غير موجود');
        }

        console.log('🔍 البحث عن vendor المدير...');

        let adminVendor = await tx.vendor.findUnique({
          where: { userId: adminUser.id },
        });

        if (!adminVendor) {
          console.log('⚠️ vendor المدير غير موجود، جاري إنشاء واحد...');
          adminVendor = await tx.vendor.create({
            data: {
              userId: adminUser.id,
              phone: adminUser.phone || '',
              address: '',
              capitalBalance: 0,
              isApproved: true,
            },
          });
          console.log('✅ تم إنشاء vendor للمدير:', adminVendor.id);
        } else {
          console.log('✅ تم العثور على vendor المدير:', adminVendor.id);
        }

        createdVendorId = adminVendor.id;
      }

      console.log('💰 حساب نسبة المساهمة...');

      const vendor = await tx.vendor.findUnique({
        where: { id: createdVendorId },
        select: { capitalBalance: true },
      });

      const currentTotalCapital = vendor?.capitalBalance || 0;
      const newTotalCapital = currentTotalCapital + parsedCapitalAmount;
      const actualPercent = newTotalCapital > 0 ? (parsedCapitalAmount / newTotalCapital) * 100 : 0;

      console.log('📊 حساب نسبة المساهمة:');
      console.log(`   رأس المال الحالي: ${currentTotalCapital} جنيه`);
      console.log(`   مساهمة الشريك: ${parsedCapitalAmount} جنيه`);
      console.log(`   رأس المال الجديد: ${newTotalCapital} جنيه`);
      console.log(`   النسبة المُدخلة: ${parsedCapitalPercent}%`);
      console.log(`   النسبة المحسوبة: ${actualPercent.toFixed(2)}%`);

      console.log('📝 إنشاء سجل الشريك...');

      const partner = await tx.partnerCapital.create({
        data: {
          vendorId: createdVendorId,
          partnerName,
          partnerType,
          capitalAmount: parsedCapitalAmount,
          initialAmount: parsedCapitalAmount,
          currentAmount: parsedCapitalAmount,
          capitalPercent: actualPercent,
          notes,
        },
      });

      console.log('✅ تم إنشاء الشريك:', partner.id);
      console.log('💵 تحديث رأس مال الـ vendor...');

      await tx.vendor.update({
        where: { id: createdVendorId },
        data: {
          capitalBalance: {
            increment: parsedCapitalAmount,
          },
        },
      });

      console.log('✅ تم تحديث رأس المال');
      console.log('📊 إنشاء معاملة إيداع...');

      await tx.capitalTransaction.create({
        data: {
          vendorId: createdVendorId,
          partnerId: partner.id,
          type: 'DEPOSIT',
          amount: parsedCapitalAmount,
          balanceBefore: 0,
          balanceAfter: parsedCapitalAmount,
          description: `إيداع رأس مال من الشريك: ${partnerName}`,
          descriptionAr: `إيداع رأس مال من الشريك: ${partnerName}`,
        },
      });

      console.log('✅ تمت إضافة الشريك بنجاح!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return { partner, vendorId: createdVendorId };
    });

    vendorId = result.vendorId;

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الشريك بنجاح',
      partner: result.partner,
      userPassword,
    });
  } catch (error) {
    console.error('❌ Error adding partner:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الشريك' },
      { status: 500 }
    );
  }
}
