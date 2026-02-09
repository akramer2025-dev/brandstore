import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - إضافة بضاعة خارج النظام
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // الحصول على بيانات الـ vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        capitalBalance: true,
        canAddOfflineProducts: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'حساب الشريك غير موجود' }, { status: 404 });
    }

    // التحقق من الصلاحية
    if (!vendor.canAddOfflineProducts) {
      return NextResponse.json({ 
        error: 'عذراً، ليس لديك صلاحية إضافة بضاعة خارج النظام' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { purchasePrice, sellingPrice, quantity = 1, description, supplierId } = body;

    // التحقق من البيانات
    if (!purchasePrice || !sellingPrice) {
      return NextResponse.json({ 
        error: 'سعر الشراء وسعر البيع مطلوبان' 
      }, { status: 400 });
    }

    const parsedPurchasePrice = parseFloat(purchasePrice);
    const parsedSellingPrice = parseFloat(sellingPrice);
    const parsedQuantity = parseInt(quantity);

    if (parsedPurchasePrice <= 0 || parsedSellingPrice <= 0 || parsedQuantity <= 0) {
      return NextResponse.json({ 
        error: 'الأسعار والكمية يجب أن تكون أكبر من صفر' 
      }, { status: 400 });
    }

    // حساب التكلفة الإجمالية والربح
    const totalCost = parsedPurchasePrice * parsedQuantity;
    const totalRevenue = parsedSellingPrice * parsedQuantity;
    const profit = totalRevenue - totalCost;

    // التحقق من رأس المال
    if (vendor.capitalBalance < totalCost) {
      return NextResponse.json({ 
        error: `رأس المال غير كافٍ. الرصيد الحالي: ${vendor.capitalBalance.toFixed(2)} جنيه، المطلوب: ${totalCost.toFixed(2)} جنيه` 
      }, { status: 400 });
    }

    // إضافة البضاعة الخارجية
    const offlineProduct = await prisma.offlineProduct.create({
      data: {
        vendorId: vendor.id,
        supplierId: supplierId || null,
        description: description || `بضاعة ${new Date().toLocaleDateString('ar-EG')}`,
        purchasePrice: parsedPurchasePrice,
        sellingPrice: parsedSellingPrice,
        quantity: parsedQuantity,
        profit,
        createdBy: session.user.name || session.user.email || 'Unknown',
      },
    });

    // خصم سعر الشراء من رأس المال
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        capitalBalance: {
          decrement: totalCost,
        },
      },
    });

    // تسجيل المعاملة
    await prisma.capitalTransaction.create({
      data: {
        vendorId: vendor.id,
        type: 'PURCHASE',
        amount: totalCost,
        balanceBefore: vendor.capitalBalance,
        balanceAfter: updatedVendor.capitalBalance,
        description: `شراء بضاعة خارج النظام - ${parsedQuantity} وحدة`,
        descriptionAr: `شراء بضاعة خارج النظام - ${parsedQuantity} وحدة`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة البضاعة بنجاح',
      data: {
        offlineProduct,
        totalCost,
        totalRevenue,
        profit,
        capitalBalance: updatedVendor.capitalBalance,
      },
    });
  } catch (error) {
    console.error('Error adding offline product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة البضاعة' },
      { status: 500 }
    );
  }
}

// GET - جلب البضائع الخارجية
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, canAddOfflineProducts: true },
    });

    if (!vendor || !vendor.canAddOfflineProducts) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const offlineProducts = await prisma.offlineProduct.findMany({
      where: { vendorId: vendor.id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // حساب الإحصائيات
    const stats = offlineProducts.reduce((acc, product) => {
      const remainingQuantity = product.quantity - product.soldQuantity;
      const remainingCost = product.purchasePrice * remainingQuantity;
      const remainingRevenue = product.sellingPrice * remainingQuantity;
      const soldRevenue = product.sellingPrice * product.soldQuantity;
      
      return {
        totalCost: acc.totalCost + (product.purchasePrice * product.quantity),
        totalRemainingRevenue: acc.totalRemainingRevenue + remainingRevenue,
        totalSoldRevenue: acc.totalSoldRevenue + soldRevenue,
        totalProfit: acc.totalProfit + product.profit,
        totalQuantity: acc.totalQuantity + product.quantity,
        totalSoldQuantity: acc.totalSoldQuantity + product.soldQuantity,
        totalRemainingQuantity: acc.totalRemainingQuantity + remainingQuantity,
      };
    }, { 
      totalCost: 0, 
      totalRemainingRevenue: 0, 
      totalSoldRevenue: 0,
      totalProfit: 0, 
      totalQuantity: 0,
      totalSoldQuantity: 0,
      totalRemainingQuantity: 0,
    });

    return NextResponse.json({
      offlineProducts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching offline products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}
