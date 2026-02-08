import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - تعديل مورد
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
    const { name, phone, address, notes } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'اسم المورد مطلوب' 
      }, { status: 400 });
    }

    // التحقق من أن المورد يخص الشريك
    const existingSupplier = await prisma.offlineSupplier.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json({ 
        error: 'المورد غير موجود' 
      }, { status: 404 });
    }

    const updatedSupplier = await prisma.offlineSupplier.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      supplier: updatedSupplier,
      message: 'تم تعديل بيانات المورد بنجاح' 
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تعديل المورد' },
      { status: 500 }
    );
  }
}

// DELETE - حذف مورد
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
      select: { id: true, canAddOfflineProducts: true },
    });

    if (!vendor || !vendor.canAddOfflineProducts) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // التحقق من أن المورد يخص الشريك
    const existingSupplier = await prisma.offlineSupplier.findFirst({
      where: {
        id: params.id,
        vendorId: vendor.id,
      },
      include: {
        offlineProducts: true,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json({ 
        error: 'المورد غير موجود' 
      }, { status: 404 });
    }

    // التحقق من وجود بضائع مرتبطة
    if (existingSupplier.offlineProducts.length > 0) {
      return NextResponse.json({ 
        error: `لا يمكن حذف المورد لأنه يحتوي على ${existingSupplier.offlineProducts.length} منتج. قم بحذف أو نقل المنتجات أولاً.` 
      }, { status: 400 });
    }

    await prisma.offlineSupplier.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف المورد بنجاح' 
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المورد' },
      { status: 500 }
    );
  }
}
