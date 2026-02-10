import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب بيانات شريك واحد (للمدير فقط)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;

    // جلب الـ Vendor بدلاً من PartnerCapital
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        partners: true, // PartnerCapital records إن وجدت
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // جلب المنتجات
    const products = await prisma.product.findMany({
      where: {
        vendorId: vendor.id
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        stock: true,
        soldCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // حساب إحصائيات الطلبات
    const orderStats = await prisma.order.aggregate({
      where: {
        vendorId: vendor.id,
        status: {
          in: ['DELIVERED']
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // جلب آخر الطلبات
    const recentOrders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const totalRevenue = orderStats._sum?.totalAmount || 0;
    const totalOrders = orderStats._count || 0;
    const capitalPercent = vendor.commissionRate || 15;
    const totalProfit = totalRevenue * (capitalPercent / 100);

    // جلب المعاملات المالية إن وجدت
    const transactions = await prisma.capitalTransaction.findMany({
      where: {
        vendorId: vendor.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // استخدام بيانات PartnerCapital إن وجدت، وإلا استخدم بيانات Vendor
    const partnerCapital = vendor.partners?.[0];

    return NextResponse.json({
      id: vendor.id,
      partnerName: vendor.storeName || vendor.user?.name || 'غير محدد',
      partnerType: partnerCapital?.partnerType || 'VENDOR',
      capitalAmount: vendor.capitalBalance || 0,
      initialAmount: vendor.capitalBalance || 0,
      currentAmount: vendor.capitalBalance || 0,
      capitalPercent: capitalPercent,
      joinDate: vendor.createdAt.toISOString(),
      isActive: vendor.isActive,
      notes: vendor.description || null,
      email: vendor.user?.email || '',
      phone: vendor.user?.phone || vendor.phone || '',
      user: vendor.user ? {
        email: vendor.user.email || '',
        name: vendor.user.name || ''
      } : null,
      hasAccount: !!vendor.user,
      userId: vendor.user?.id,
      canDeleteOrders: vendor.canDeleteOrders || false,
      canUploadShein: vendor.canUploadShein || false,
      canAddOfflineProducts: vendor.canAddOfflineProducts || false,
      // إحصائيات
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      totalProfit,
      // البيانات التفصيلية
      transactions,
      products: products.map(p => ({
        ...p,
        sold: p.soldCount
      })),
      recentOrders: recentOrders.map(o => ({
        ...o,
        total: o.totalAmount
      }))
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

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
      canUploadShein,
      canAddOfflineProducts,
    } = body;

    // التحقق من وجود الـ Vendor
    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingVendor) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // تحضير البيانات للتحديث
    const updateData: any = {};

    // تحديث اسم المتجر
    if (partnerName !== undefined) {
      updateData.storeName = partnerName;
      updateData.storeNameAr = partnerName;
    }

    // تحديث الملاحظات
    if (notes !== undefined) updateData.description = notes;
    
    // تحديث الحالة
    if (isActive !== undefined) updateData.isActive = isActive;

    // تحديث رأس المال إذا تغير
    if (capitalAmount !== undefined && parseFloat(capitalAmount) !== existingVendor.capitalBalance) {
      const oldAmount = existingVendor.capitalBalance;
      const newAmount = parseFloat(capitalAmount);
      const difference = newAmount - oldAmount;

      updateData.capitalBalance = newAmount;

      // إنشاء معاملة
      await prisma.capitalTransaction.create({
        data: {
          vendorId: existingVendor.id,
          type: difference > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
          amount: Math.abs(difference),
          balanceBefore: oldAmount,
          balanceAfter: newAmount,
          description: `تعديل رأس مال الشريك: ${partnerName || existingVendor.storeName}`,
          descriptionAr: `تعديل رأس مال الشريك: ${partnerName || existingVendor.storeName}`,
        },
      });
    }

    // تحديث نسبة العمولة إذا تغيرت
    if (capitalPercent !== undefined) {
      updateData.commissionRate = parseFloat(capitalPercent);
    }

    // تحديث الصلاحيات
    if (canDeleteOrders !== undefined) updateData.canDeleteOrders = canDeleteOrders;
    if (canUploadShein !== undefined) updateData.canUploadShein = canUploadShein;
    if (canAddOfflineProducts !== undefined) updateData.canAddOfflineProducts = canAddOfflineProducts;

    // تحديث الـ Vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    // تغيير كلمة المرور إذا طُلِب
    if (changePassword && newPassword && existingVendor.user?.id) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: existingVendor.user.id },
        data: { password: hashedPassword },
      });

      console.log('✅ تم تغيير كلمة المرور للشريك:', partnerName || existingVendor.storeName);
    }

    console.log('✅ تم تحديث بيانات الشريك:', updatedVendor.storeName);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات الشريك بنجاح',
      partner: updatedVendor,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;

    // التحقق من وجود الـ Vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    // إيقاف الـ Vendor بدلاً من حذفه (soft delete)
    await prisma.vendor.update({
      where: { id },
      data: {
        isActive: false,
        isApproved: false,
      },
    });

    // إيقاف حساب المستخدم أيضاً إن وجد
    if (vendor.user) {
      await prisma.user.update({
        where: { id: vendor.user.id },
        data: {
          isActive: false,
        },
      });
    }

    console.log('✅ تم إيقاف الشريك:', vendor.storeName);

    return NextResponse.json({
      success: true,
      message: 'تم إيقاف الشريك بنجاح',
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الشريك' },
      { status: 500 }
    );
  }
}
