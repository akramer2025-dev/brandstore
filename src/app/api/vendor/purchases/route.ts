import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { supplier, supplierPhone, tripExpense, notes, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'يجب إضافة منتج واحد على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من البيانات
    for (const item of items) {
      if (!item.productNameAr || item.quantity <= 0 || item.purchasePrice <= 0 || item.sellingPrice <= 0) {
        return NextResponse.json(
          { error: 'بيانات المنتج غير صحيحة' },
          { status: 400 }
        );
      }
    }

    // حساب الإجماليات
    const totalPurchasePrice = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.purchasePrice), 0
    );

    const totalFromCapital = items
      .filter((item: any) => item.fromCapital)
      .reduce((sum: number, item: any) => sum + (item.quantity * item.purchasePrice), 0);

    const totalToDeduct = totalFromCapital + (tripExpense || 0);

    // جلب رأس المال
    let capital = null;
    if (totalFromCapital > 0 || tripExpense > 0) {
      capital = await prisma.partnerCapital.findFirst({
        where: {
          vendorId: session.user.id,
          partnerType: 'OWNER',
        },
      });

      if (!capital) {
        return NextResponse.json(
          { error: 'يجب تسجيل رأس المال أولاً' },
          { status: 400 }
        );
      }

      if (capital.currentAmount < totalToDeduct) {
        return NextResponse.json(
          { error: `رأس المال غير كافٍ. المتبقي: ${capital.currentAmount} ج، المطلوب: ${totalToDeduct} ج` },
          { status: 400 }
        );
      }
    }

    // إنشاء رقم فاتورة
    const receiptNumber = `INV-${Date.now()}`;

    // حفظ البيانات في transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. إنشاء Purchase لكل منتج
      const purchases = await Promise.all(
        items.map((item: any) =>
          tx.purchase.create({
            data: {
              vendorId: session.user.id,
              productName: item.productNameAr,
              quantity: item.quantity,
              unitCost: item.purchasePrice,
              totalCost: item.quantity * item.purchasePrice,
              supplier: supplier || 'غير محدد',
              purchaseDate: new Date(),
              receiptNumber,
              fromCapital: item.fromCapital,
              sellingPrice: item.sellingPrice,
              commissionFromStore: item.commissionFromStore,
            },
          })
        )
      );

      // 2. إضافة مصاريف المشوار إذا وُجدت
      if (tripExpense && tripExpense > 0) {
        await tx.vendorExpense.create({
          data: {
            vendorId: session.user.id,
            expenseType: 'TRANSPORTATION',
            amount: tripExpense,
            description: `مصاريف مشوار شراء - ${receiptNumber}`,
            expenseDate: new Date(),
            receiptNumber,
          },
        });
      }

      // 3. خصم من رأس المال
      if (capital && totalToDeduct > 0) {
        await tx.partnerCapital.update({
          where: { id: capital.id },
          data: {
            currentAmount: capital.currentAmount - totalToDeduct,
          },
        });
      }

      // 4. إضافة/تحديث المخزون لكل منتج
      for (const item of items) {
        // البحث عن منتج موجود بنفس الاسم
        const existingProduct = await tx.product.findFirst({
          where: {
            name: item.productNameAr,
            vendorId: session.user.id,
          },
        });

        if (existingProduct) {
          // تحديث المخزون
          await tx.product.update({
            where: { id: existingProduct.id },
            data: {
              stock: existingProduct.stock + item.quantity,
            },
          });

          // تحديث/إنشاء InventoryItem
          const existingInventory = await tx.inventoryItem.findFirst({
            where: {
              vendorId: session.user.id,
              productId: existingProduct.id,
            },
          });

          if (existingInventory) {
            await tx.inventoryItem.update({
              where: { id: existingInventory.id },
              data: {
                totalPurchased: existingInventory.totalPurchased + item.quantity,
                currentStock: existingInventory.currentStock + item.quantity,
              },
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                vendorId: session.user.id,
                productId: existingProduct.id,
                totalPurchased: item.quantity,
                currentStock: item.quantity,
                unitCost: item.purchasePrice,
              },
            });
          }
        }
      }

      return { purchases, receiptNumber };
    });

    return NextResponse.json({
      success: true,
      purchase: result,
      message: 'تم تسجيل الفاتورة بنجاح',
    });

  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'فشل حفظ الفاتورة' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        vendorId: session.user.id,
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });

    // تجميع حسب رقم الفاتورة
    const groupedPurchases = purchases.reduce((acc: any, purchase: any) => {
      const key = purchase.receiptNumber || purchase.id;
      if (!acc[key]) {
        acc[key] = {
          receiptNumber: purchase.receiptNumber,
          supplier: purchase.supplier,
          purchaseDate: purchase.purchaseDate,
          items: [],
          totalCost: 0,
          totalFromCapital: 0,
          totalOnBehalf: 0,
        };
      }
      
      acc[key].items.push(purchase);
      acc[key].totalCost += purchase.totalCost;
      
      if (purchase.fromCapital) {
        acc[key].totalFromCapital += purchase.totalCost;
      } else {
        acc[key].totalOnBehalf += purchase.totalCost;
      }

      return acc;
    }, {});

    return NextResponse.json({
      purchases: Object.values(groupedPurchases),
    });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'فشل جلب المشتريات' },
      { status: 500 }
    );
  }
}
