import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - تعديل بضاعة
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { purchasePrice, sellingPrice, quantity, description, supplierId } = body;

    if (!purchasePrice || !sellingPrice || !quantity) {
      return NextResponse.json({ 
        error: 'جميع الحقول مطلوبة' 
      }, { status: 400 });
    }

    const parsedPurchasePrice = parseFloat(purchasePrice);
    const parsedSellingPrice = parseFloat(sellingPrice);
    const parsedQuantity = parseInt(quantity);

    if (parsedPurchasePrice <= 0 || parsedSellingPrice <= 0 || parsedQuantity <= 0) {
      return NextResponse.json({ 
        error: 'القيم يجب أن تكون أكبر من صفر' 
      }, { status: 400 });
    }

    // التحقق من أن البضاعة تخص الشريك
    const existingProduct = await prisma.offlineProduct.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ 
        error: 'البضاعة غير موجودة' 
      }, { status: 404 });
    }

    // حساب الربح الجديد
    const profit = (parsedSellingPrice - parsedPurchasePrice) * parsedQuantity;

    const updatedProduct = await prisma.offlineProduct.update({
      where: { id: params.id },
      data: {
        purchasePrice: parsedPurchasePrice,
        sellingPrice: parsedSellingPrice,
        quantity: parsedQuantity,
        description: description?.trim() || existingProduct.description,
        supplierId: supplierId || existingProduct.supplierId,
        profit,
      },
    });

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: 'تم تعديل بيانات البضاعة بنجاح' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تعديل البضاعة' },
      { status: 500 }
    );
  }
}

// DELETE - حذف بضاعة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, capitalBalance: true, canAddOfflineProducts: true },
    });

    if (!vendor || !vendor.canAddOfflineProducts) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // التحقق من أن البضاعة تخص الشريك
    const existingProduct = await prisma.offlineProduct.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ 
        error: 'البضاعة غير موجودة' 
      }, { status: 404 });
    }

    // التحقق من وجود مبيعات
    if (existingProduct.soldQuantity > 0) {
      return NextResponse.json({ 
        error: 'لا يمكن حذف البضاعة لأنها تحتوي على مبيعات مسجلة' 
      }, { status: 400 });
    }

    // إرجاع التكلفة لرأس المال
    const totalCost = existingProduct.purchasePrice * existingProduct.quantity;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        capitalBalance: {
          increment: totalCost,
        },
      },
    });

    // تسجيل المعاملة
    await prisma.capitalTransaction.create({
      data: {
        vendorId: vendor.id,
        type: 'DEPOSIT',
        amount: totalCost,
        balanceBefore: vendor.capitalBalance,
        balanceAfter: updatedVendor.capitalBalance,
        description: `إلغاء شراء بضاعة - ${existingProduct.quantity} وحدة`,
        descriptionAr: `إلغاء شراء بضاعة - ${existingProduct.quantity} وحدة`,
      },
    });

    // حذف البضاعة
    await prisma.offlineProduct.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف البضاعة وإرجاع التكلفة لرأس المال',
      refundedAmount: totalCost,
      newBalance: updatedVendor.capitalBalance,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف البضاعة' },
      { status: 500 }
    );
  }
}
