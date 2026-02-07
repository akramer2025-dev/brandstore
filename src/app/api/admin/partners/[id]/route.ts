import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب بيانات شريك واحد (للمدير فقط)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = params;

    const partner = await prisma.partnerCapital.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        }
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // جلب المنتجات
    const products = await prisma.product.findMany({
      where: {
        vendorId: partner.vendorId
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        stock: true,
        sold: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // حساب إحصائيات الطلبات
    const orderStats = await prisma.order.aggregate({
      where: {
        vendorId: partner.vendorId,
        status: {
          in: ['DELIVERED', 'SHIPPED']
        }
      },
      _sum: {
        total: true
      },
      _count: true
    });

    // جلب آخر الطلبات
    const recentOrders = await prisma.order.findMany({
      where: {
        vendorId: partner.vendorId
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const totalRevenue = orderStats._sum.total || 0;
    const totalOrders = orderStats._count || 0;
    const totalProfit = totalRevenue * (partner.capitalPercent / 100);

    return NextResponse.json({
      ...partner,
      email: partner.vendor?.user?.email || '',
      hasAccount: !!partner.vendor?.user,
      userId: partner.vendor?.user?.id,
      canDeleteOrders: partner.vendor?.canDeleteOrders || false,
      // إحصائيات
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      totalProfit,
      // البيانات التفصيلية
      transactions: partner.transactions,
      products,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الشريك' },
      { status: 500 }
    );
  }
}

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
      changePassword,
      newPassword,
      canDeleteOrders,
    } = body;

    // التحقق من وجود الشريك
    const existingPartner = await prisma.partnerCapital.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            userId: true,
          },
        },
      },
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

    // تغيير كلمة المرور إذا طُلِب
    if (changePassword && newPassword && existingPartner.vendor?.userId) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: existingPartner.vendor.userId },
        data: { password: hashedPassword },
      });

      console.log('✅ تم تغيير كلمة المرور للشريك:', partnerName || existingPartner.partnerName);
    }

    // تحديث صلاحية حذف الطلبات للـ Vendor إذا كان موجوداً
    if (existingPartner.vendorId && canDeleteOrders !== undefined) {
      await prisma.vendor.update({
        where: { id: existingPartner.vendorId },
        data: { canDeleteOrders },
      });
      console.log('✅ تم تحديث صلاحية حذف الطلبات:', canDeleteOrders);
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
