import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - تحديث بيانات شريك (للمدير فقط)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      partnerName,
      capitalAmount,
      capitalPercent,
      partnerType,
      notes,
      isActive,
    } = body;

    // التحقق من وجود الشريك
    const existingPartner = await prisma.partnerCapital.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // تحضير البيانات للتحديث
    const updateData: any = {};

    if (partnerName !== undefined) updateData.partnerName = partnerName;
    if (partnerType !== undefined) updateData.partnerType = partnerType;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    // تحديث رأس المال إذا تغير
    if (capitalAmount !== undefined && parseFloat(capitalAmount) !== existingPartner.capitalAmount) {
      const oldAmount = existingPartner.capitalAmount;
      const newAmount = parseFloat(capitalAmount);
      const difference = newAmount - oldAmount;

      updateData.capitalAmount = newAmount;
      updateData.currentAmount = existingPartner.currentAmount + difference;

      // تحديث رأس مال الـ vendor
      await prisma.vendor.update({
        where: { id: existingPartner.vendorId },
        data: {
          capitalBalance: {
            increment: difference,
          },
        },
      });

      // إنشاء معاملة
      await prisma.capitalTransaction.create({
        data: {
          vendorId: existingPartner.vendorId,
          partnerId: id,
          type: difference > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
          amount: Math.abs(difference),
          balanceBefore: oldAmount,
          balanceAfter: newAmount,
          description: `تعديل رأس مال الشريك: ${partnerName || existingPartner.partnerName}`,
          descriptionAr: `تعديل رأس مال الشريك: ${partnerName || existingPartner.partnerName}`,
        },
      });
    }

    // تحديث النسبة إذا تغيرت
    if (capitalPercent !== undefined) {
      updateData.capitalPercent = parseFloat(capitalPercent);
    }

    // تحديث الشريك
    const updatedPartner = await prisma.partnerCapital.update({
      where: { id },
      data: updateData,
    });

    console.log('✅ تم تحديث بيانات الشريك:', updatedPartner.partnerName);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات الشريك بنجاح',
      partner: updatedPartner,
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الشريك' },
      { status: 500 }
    );
  }
}

// DELETE - حذف شريك (للمدير فقط)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = params;

    // التحقق من وجود الشريك
    const partner = await prisma.partnerCapital.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // تحديث رأس مال الـ vendor (طرح رأس مال الشريك)
    await prisma.vendor.update({
      where: { id: partner.vendorId },
      data: {
        capitalBalance: {
          decrement: partner.currentAmount,
        },
      },
    });

    // حذف الشريك
    await prisma.partnerCapital.delete({
      where: { id },
    });

    console.log('✅ تم حذف الشريك:', partner.partnerName);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الشريك بنجاح',
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الشريك' },
      { status: 500 }
    );
  }
}
