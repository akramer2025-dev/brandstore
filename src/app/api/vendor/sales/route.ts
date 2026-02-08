import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 });
    }

    const { items, total } = await req.json();

    // التحقق من البيانات
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 });
    }

    // التحقق من المخزون
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json({ 
          error: `المنتج ${item.productId} غير موجود` 
        }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `الكمية المتوفرة من ${product.nameAr} غير كافية` 
        }, { status: 400 });
      }
    }

    // إنشاء عملية البيع في transaction
    const result = await prisma.$transaction(async (tx) => {
      // إنشاء sales لكل منتج
      const sales = [];
      let totalRevenue = 0;
      let totalProfit = 0;
      
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (product) {
          // استخدام السعر المخصص إذا تم تعديله، وإلا السعر الأصلي
          const salePrice = item.price || product.price;
          const costPrice = product.productionCost || 0;
          const itemTotal = salePrice * item.quantity;
          const itemProfit = (salePrice - costPrice) * item.quantity;
          
          totalRevenue += itemTotal;
          totalProfit += itemProfit;
          
          // تسجيل البيع
          const sale = await tx.sale.create({
            data: {
              vendorId: vendor.id,
              productName: product.name,
              productNameAr: product.nameAr,
              quantity: item.quantity,
              unitPrice: salePrice,
              totalAmount: itemTotal,
              costPrice: costPrice,
              profit: itemProfit,
              saleDate: new Date(),
            }
          });
          sales.push(sale);

          // تحديث المخزون
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              },
              soldCount: {
                increment: item.quantity
              }
            }
          });
        }
      }

      // إضافة الإيراد لرأس المال
      const balanceBefore = vendor.capitalBalance || 0;
      const updatedVendor = await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          capitalBalance: {
            increment: totalRevenue,
          },
        },
      });

      // تسجيل معاملة رأس المال
      await tx.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type: 'SALE',
          amount: totalRevenue,
          balanceBefore: balanceBefore,
          balanceAfter: updatedVendor.capitalBalance,
          description: `بيع - POS (${items.length} منتج)`,
          descriptionAr: `بيع - نقطة البيع (${items.length} منتج)`,
        },
      });

      return { sales, totalRevenue, totalProfit, newBalance: updatedVendor.capitalBalance };
    });

    return NextResponse.json({
      success: true,
      message: 'تم إتمام البيع بنجاح',
      sales: result.sales,
      totalRevenue: result.totalRevenue,
      totalProfit: result.totalProfit,
      newBalance: result.newBalance,
    });

  } catch (error) {
    console.error('Error completing sale:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إتمام البيع' },
      { status: 500 }
    );
  }
}
