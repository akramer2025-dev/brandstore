import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// إضافة منتج مستورد
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // التحقق من أن المستخدم موظف تسويق
    if (session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    // البحث عن موظف التسويق
    const staff = await prisma.marketingStaff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return NextResponse.json({ 
        error: 'الحساب غير موجود' 
      }, { status: 404 });
    }

    if (!staff.isApproved) {
      return NextResponse.json({ 
        error: 'حسابك غير مفعّل بعد' 
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      price,
      stock,
      categoryId,
      images,
      importSource, // SHEIN, ALIEXPRESS, ALIBABA, TAOBAO, TEMU, OTHER
      importLink, // رابط المنتج الأصلي
      downPaymentPercent = 30, // نسبة الدفعة المقدمة
      estimatedDeliveryDays = 14, // مدة التوصيل المتوقعة
    } = body;

    if (!nameAr || !price || !categoryId || !importSource) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // التحقق من صحة مصدر الاستيراد
    const validSources = ['SHEIN', 'ALIEXPRESS', 'ALIBABA', 'TAOBAO', 'TEMU', 'OTHER'];
    if (!validSources.includes(importSource)) {
      return NextResponse.json({ 
        error: 'مصدر الاستيراد غير صالح' 
      }, { status: 400 });
    }

    // إنشاء المنتج
    const product = await prisma.product.create({
      data: {
        nameAr,
        nameEn: nameEn || nameAr,
        descriptionAr,
        descriptionEn: descriptionEn || descriptionAr,
        price: parseFloat(price.toString()),
        stock: parseInt(stock?.toString() || '0'),
        categoryId,
        images: images || '[]',
        isImported: true,
        importSource,
        importLink,
        marketingStaffId: staff.id,
        downPaymentPercent: parseFloat(downPaymentPercent.toString()),
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays.toString()),
        // السعر الأصلي (للعرض بنسبة الخصم الوهمية)
        originalPrice: parseFloat(price.toString()) * 1.35, // 35% أعلى
      },
      include: {
        category: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
      },
    });

    console.log('✅ تم إضافة منتج مستورد:', product.id);

    return NextResponse.json({
      success: true,
      product,
      message: `تم إضافة المنتج بنجاح 🎉\nعمولتك: ${(parseFloat(price.toString()) * staff.commissionRate / 100).toFixed(2)} جنيه لكل عملية بيع`,
    });

  } catch (error) {
    console.error('❌ خطأ في إضافة المنتج:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في إضافة المنتج' 
    }, { status: 500 });
  }
}

// جلب منتجات موظف التسويق
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    if (session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const staff = await prisma.marketingStaff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 });
    }

    // جلب منتجات الموظف
    const products = await prisma.product.findMany({
      where: { marketingStaffId: staff.id },
      include: {
        category: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // حساب الإحصائيات
    const stats = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      totalSold: products.reduce((sum, p) => sum + p.soldCount, 0),
      totalRevenue: products.reduce((sum, p) => sum + (p.price * p.soldCount), 0),
      estimatedCommission: products.reduce((sum, p) => 
        sum + (p.price * p.soldCount * staff.commissionRate / 100), 0
      ),
    };

    return NextResponse.json({
      products,
      stats,
      commissionRate: staff.commissionRate,
    });

  } catch (error) {
    console.error('❌ خطأ في جلب المنتجات:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في جلب البيانات' 
    }, { status: 500 });
  }
}
