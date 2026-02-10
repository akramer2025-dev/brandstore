import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// إضافة منتج جديد
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

    const data = await req.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      originalPrice,
      stock,
      categoryId,
      images,
      isVisible = true,
      sizes,
      colors,
      saleType = 'SINGLE',
      productionCost,
      platformCommission = 5,
      // حقول جديدة لمنتجات الوسيط
      productSource = 'OWNED',
      supplierName,
      supplierPhone,
      supplierCost,
      supplierNotes,
    } = data;

    // التحقق من البيانات المطلوبة
    if (!nameAr || !price || stock === undefined || !images) {
      return NextResponse.json(
        { error: 'الرجاء ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // إذا لم يتم تحديد صنف، نستخدم صنف افتراضي أو ننشئ واحد
    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      // البحث عن صنف "عام" أو إنشاءه
      let defaultCategory = await prisma.category.findFirst({
        where: { name: 'General' }
      });
      
      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: { name: 'General', nameAr: 'عام' }
        });
      }
      finalCategoryId = defaultCategory.id;
    }

    // حساب تكلفة المنتج الإجمالية (سعر الشراء × الكمية)
    const purchasePrice = productionCost ? parseFloat(productionCost) : 0;
    const totalCost = purchasePrice * parseInt(stock);
    
    // متغير لتتبع إذا تم الخصم أو لا
    let willDeduct = false;
    let warningMessage = '';
    
    // التحقق من سعر الشراء والرأس المال إذا كان المنتج مملوك (ليس وسيط)
    if (productSource === 'OWNED' && totalCost > 0) {
      // التأكد من إدخال سعر الشراء
      if (!productionCost || parseFloat(productionCost) <= 0) {
        console.warn('⚠️ تحذير: لم يتم إدخال سعر الشراء - لن يتم خصم من رأس المال');
        warningMessage = '\n⚠️ لم يتم إدخال سعر الشراء';
      } else {
        // التحقق من كفاية رأس المال
        const currentBalance = vendor.capitalBalance || 0;
        if (currentBalance < totalCost) {
          // نسمح بالإضافة بس منخصمش من رأس المال
          console.warn(`⚠️ رأس المال غير كافٍ (${currentBalance} < ${totalCost}) - سيتم إضافة المنتج بدون خصم`);
          warningMessage = `\n⚠️ رأس المال غير كافٍ! المتاح: ${currentBalance.toLocaleString()} ج، المطلوب: ${totalCost.toLocaleString()} ج\n💡 تم إضافة المنتج بدون خصم من رأس المال`;
        } else {
          // رأس المال كافي - سيتم الخصم
          willDeduct = true;
        }
      }
    }

    // إنشاء المنتج وخصم التكلفة من رأس المال
    const result = await prisma.$transaction(async (tx) => {
      // إنشاء المنتج
      const product = await tx.product.create({
        data: {
          name: name || nameAr,
          nameAr,
          description: description || '',
          descriptionAr: descriptionAr || '',
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          stock: parseInt(stock),
          categoryId: finalCategoryId,
          images,
          vendorId: vendor.id,
          isVisible,
          isActive: true, // تفعيل المنتج تلقائياً
          sizes: sizes || null,
          colors: colors || null,
          saleType: saleType || 'SINGLE',
          productionCost: purchasePrice || null,
          platformCommission: platformCommission || 5,
          // حقول منتجات الوسيط
          productSource: productSource || 'OWNED',
          supplierName: productSource === 'CONSIGNMENT' ? supplierName : null,
          supplierPhone: productSource === 'CONSIGNMENT' ? supplierPhone : null,
          supplierCost: productSource === 'CONSIGNMENT' && supplierCost ? parseFloat(supplierCost) : null,
          supplierNotes: productSource === 'CONSIGNMENT' ? supplierNotes : null,
          isSupplierPaid: false,
        },
        include: {
          category: true,
          vendor: true,
        }
      });

      // خصم التكلفة من رأس المال إذا كان المنتج مملوك ورأس المال كافي
      if (productSource === 'OWNED' && totalCost > 0 && willDeduct) {
        const balanceBefore = vendor.capitalBalance || 0;
        const balanceAfter = balanceBefore - totalCost;
        
        await tx.vendor.update({
          where: { id: vendor.id },
          data: {
            capitalBalance: {
              decrement: totalCost
            }
          }
        });

        // تسجيل المعاملة
        await tx.capitalTransaction.create({
          data: {
            vendorId: vendor.id,
            type: 'PURCHASE',
            amount: totalCost,
            description: `شراء منتج: ${nameAr}`,
            descriptionAr: `شراء منتج: ${nameAr} (${stock} قطعة × ${purchasePrice} ج)`,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
          }
        });
      }

      return product;
    });

    // إعداد رسالة النجاح
    let successMessage = '✅ تم إضافة المنتج بنجاح!';
    
    if (productSource === 'OWNED' && totalCost > 0) {
      if (willDeduct) {
        // تم الخصم من رأس المال
        const newBalance = (vendor.capitalBalance || 0) - totalCost;
        successMessage = `✅ تم إضافة المنتج بنجاح!\n💸 تم خصم ${totalCost.toLocaleString()} ج من رأس المال (${stock} × ${purchasePrice.toLocaleString()} ج)\n💰 الرصيد المتبقي: ${newBalance.toLocaleString()} ج`;
      } else {
        // لم يتم الخصم
        successMessage = `✅ تم إضافة المنتج بنجاح!${warningMessage}`;
      }
    }

    return NextResponse.json({ 
      message: successMessage,
      product: result,
      deducted: willDeduct ? totalCost : 0,
      capitalBalance: willDeduct ? (vendor.capitalBalance || 0) - totalCost : vendor.capitalBalance
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المنتج' },
      { status: 500 }
    );
  }
}

// جلب منتجات الشريك
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';

    const orderBy: any = {};
    if (sortBy === 'soldCount') {
      orderBy.soldCount = 'desc';
    } else if (sortBy === 'price') {
      orderBy.price = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      take: limit,
      include: {
        category: true,
      },
      orderBy
    });

    // إضافة حساب الإيرادات لكل منتج
    const productsWithRevenue = products.map(p => ({
      ...p,
      revenue: p.soldCount * p.price
    }));

    return NextResponse.json({ products: productsWithRevenue });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
