import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب جميع موردين البضاعة الخارجية
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

    if (!vendor) {
      return NextResponse.json({ error: 'حساب الشريك غير موجود' }, { status: 404 });
    }

    if (!vendor.canAddOfflineProducts) {
      return NextResponse.json({ 
        error: 'ليس لديك صلاحية إدارة البضاعة الخارجية' 
      }, { status: 403 });
    }

    // جلب الموردين مع إحصائياتهم
    const suppliers = await prisma.offlineSupplier.findMany({
      where: { vendorId: vendor.id },
      include: {
        offlineProducts: {
          select: {
            id: true,
            purchasePrice: true,
            sellingPrice: true,
            quantity: true,
            soldQuantity: true,
            profit: true,
            isPaid: true,
            amountPaid: true,
          },
        },
        payments: {
          select: {
            amount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // حساب الإحصائيات لكل مورد
    const suppliersWithStats = suppliers.map(supplier => {
      const totalPurchases = supplier.offlineProducts.reduce(
        (sum, p) => sum + (p.purchasePrice * p.quantity), 
        0
      );
      const totalPaid = supplier.offlineProducts.reduce(
        (sum, p) => sum + (p.amountPaid || 0),
        0
      );
      const totalProfit = supplier.offlineProducts.reduce(
        (sum, p) => sum + p.profit, 
        0
      );
      const pendingAmount = totalPurchases - totalPaid;
      const totalProducts = supplier.offlineProducts.length;
      const lastPaymentDate = supplier.payments[0]?.createdAt || null;

      // حساب البضاعة المتبقية عند المورد
      const remainingQuantity = supplier.offlineProducts.reduce(
        (sum, p) => sum + (p.quantity - p.soldQuantity),
        0
      );
      const remainingCost = supplier.offlineProducts.reduce(
        (sum, p) => sum + ((p.quantity - p.soldQuantity) * p.purchasePrice),
        0
      );
      const remainingExpectedRevenue = supplier.offlineProducts.reduce(
        (sum, p) => sum + ((p.quantity - p.soldQuantity) * p.sellingPrice),
        0
      );
      const soldRevenue = supplier.offlineProducts.reduce(
        (sum, p) => sum + (p.soldQuantity * p.sellingPrice),
        0
      );

      return {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        address: supplier.address,
        notes: supplier.notes,
        createdAt: supplier.createdAt,
        stats: {
          totalPurchases,
          totalPaid,
          totalProfit,
          pendingAmount,
          totalProducts,
          lastPaymentDate,
          // البضاعة المتبقية
          remainingQuantity,
          remainingCost,
          remainingExpectedRevenue,
          soldRevenue,
        },
      };
    });

    return NextResponse.json({ suppliers: suppliersWithStats });

  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

// POST - إضافة مورد جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, canAddOfflineProducts: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'حساب الشريك غير موجود' }, { status: 404 });
    }

    if (!vendor.canAddOfflineProducts) {
      return NextResponse.json({ 
        error: 'ليس لديك صلاحية إدارة البضاعة الخارجية' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, address, notes } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'اسم المورد مطلوب' 
      }, { status: 400 });
    }

    const supplier = await prisma.offlineSupplier.create({
      data: {
        vendorId: vendor.id,
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      supplier,
      message: 'تم إضافة المورد بنجاح' 
    });

  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المورد' },
      { status: 500 }
    );
  }
}
