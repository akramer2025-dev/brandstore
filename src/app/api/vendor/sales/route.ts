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

    const { items, total, paymentMethod = 'CASH' } = await req.json();

    // التحقق من البيانات
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 });
    }

    // التحقق من المخزون وحساب التكلفة والربح
    let totalCost = 0;
    let totalProfit = 0;

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

      // حساب التكلفة والربح (إذا كان موجود productionCost)
      const itemCost = (product.productionCost || 0) * item.quantity;
      const itemRevenue = product.price * item.quantity;
      
      totalCost += itemCost;
      totalProfit += (itemRevenue - itemCost);
    }

    // إنشاء عملية البيع في transaction
    const result = await prisma.$transaction(async (tx) => {
      // تسجيل البيع
      const sale = await tx.sale.create({
        data: {
          vendorId: vendor.id,
          totalAmount: total,
          totalCost,
          profit: totalProfit,
          paymentMethod,
          saleDate: new Date(),
        }
      });

      // تحديث المخزون وإنشاء سجلات العناصر
      for (const item of items) {
        // تحديث المخزون
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // تسجيل تفاصيل العملية (يمكنك إضافة model SaleItem لاحقاً)
      }

      // تحديث جرد المخزون
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (product) {
          // البحث عن سجل المخزون أو إنشاءه
          const inventory = await tx.inventoryItem.findFirst({
            where: {
              vendorId: vendor.id,
              productId: item.productId
            }
          });

          if (inventory) {
            await tx.inventoryItem.update({
              where: { id: inventory.id },
              data: {
                currentStock: product.stock,
                lastUpdated: new Date()
              }
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                vendorId: vendor.id,
                productId: item.productId,
                productName: product.nameAr,
                currentStock: product.stock,
                minStock: 10,
                lastUpdated: new Date()
              }
            });
          }
        }
      }

      return sale;
    });

    return NextResponse.json({
      success: true,
      message: 'تم إتمام البيع بنجاح',
      sale: result
    });

  } catch (error) {
    console.error('Error completing sale:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إتمام البيع' },
      { status: 500 }
    );
  }
}
