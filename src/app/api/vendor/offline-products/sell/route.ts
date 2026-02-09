import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - تسجيل بيع قطع من بضاعة موجودة
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

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

    if (!vendor.canAddOfflineProducts) {
      return NextResponse.json({ 
        error: 'عذراً، ليس لديك صلاحية إدارة البضاعة' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { productId, soldQuantity } = body;

    if (!productId || !soldQuantity) {
      return NextResponse.json({ 
        error: 'رقم البضاعة وعدد القطع المباعة مطلوبان' 
      }, { status: 400 });
    }

    const parsedSoldQuantity = parseInt(soldQuantity);
    if (parsedSoldQuantity <= 0) {
      return NextResponse.json({ 
        error: 'عدد القطع المباعة يجب أن يكون أكبر من صفر' 
      }, { status: 400 });
    }

    // جلب بيانات البضاعة
    const product = await prisma.offlineProduct.findFirst({
      where: { 
        id: productId,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'البضاعة غير موجودة' }, { status: 404 });
    }

    // حساب القطع المتبقية
    const remainingQuantity = product.quantity - product.soldQuantity;

    if (parsedSoldQuantity > remainingQuantity) {
      return NextResponse.json({ 
        error: `العدد المطلوب بيعه (${parsedSoldQuantity}) أكبر من المتبقي (${remainingQuantity})` 
      }, { status: 400 });
    }

    // حساب المبلغ المحصل والربح من هذا البيع
    const revenue = parsedSoldQuantity * product.sellingPrice;
    const cost = parsedSoldQuantity * product.purchasePrice;
    const profitFromSale = revenue - cost;

    // تحديث البضاعة فقط (بدون تحديث رأس المال)
    const updatedProduct = await prisma.offlineProduct.update({
      where: { id: productId },
      data: {
        soldQuantity: {
          increment: parsedSoldQuantity,
        },
      },
    });

    // ⚠️ ملاحظة مهمة: 
    // رأس المال لا يتحدث هنا!
    // سيتم تحديث رأس المال فقط عند عمل سند قبض من الوسيط

    // حساب القطع المتبقية الجديدة
    const newRemainingQuantity = product.quantity - updatedProduct.soldQuantity;

    return NextResponse.json({
      success: true,
      message: `تم تسجيل بيع ${parsedSoldQuantity} قطعة بنجاح (لم يتم تحديث رأس المال، استخدم سند القبض لاستلام المبلغ)`,
      data: {
        soldQuantity: parsedSoldQuantity,
        revenue,
        profitFromSale,
        totalSold: updatedProduct.soldQuantity,
        remainingQuantity: newRemainingQuantity,
        capitalBalance: vendor.capitalBalance, // الرصيد لم يتغير
      },
    });
  } catch (error) {
    console.error('Error selling offline product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل البيع' },
      { status: 500 }
    );
  }
}
