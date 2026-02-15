import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// حذف منتج مع إرجاع القيمة لرأس المال
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // التحقق من أن المنتج يخص هذا الشريك
    const product = await prisma.product.findFirst({
      where: { 
        id,
        vendorId: vendor.id 
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // حساب قيمة المنتج (تكلفة الإنتاج × الكمية)
    const productValue = (product.productionCost || 0) * product.stock;

    // حذف المنتج وإرجاع القيمة لرأس المال
    await prisma.$transaction(async (tx) => {
      // حذف المنتج فعلياً
      await tx.product.delete({
        where: { id }
      });

      // إرجاع القيمة لرأس المال إذا كانت أكبر من صفر
      if (productValue > 0) {
        const balanceBefore = vendor.capitalBalance || 0;
        const balanceAfter = balanceBefore + productValue;

        await tx.vendor.update({
          where: { id: vendor.id },
          data: {
            capitalBalance: {
              increment: productValue
            }
          }
        });

        // تسجيل المعاملة
        await tx.capitalTransaction.create({
          data: {
            vendorId: vendor.id,
            type: 'REFUND',
            amount: productValue,
            description: `حذف منتج: ${product.nameAr}`,
            descriptionAr: `إرجاع قيمة منتج محذوف: ${product.nameAr} (${product.stock} قطعة × ${product.productionCost} ج)`,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
          }
        });
      }
    });

    return NextResponse.json({ 
      message: productValue > 0
        ? `تم حذف المنتج بنجاح وإرجاع ${productValue.toFixed(2)} ج إلى رأس المال`
        : 'تم حذف المنتج بنجاح',
      refundedAmount: productValue
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
}

// جلب منتج واحد
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { 
        id,
        vendorId: vendor.id 
      },
      include: { 
        category: true,
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ product });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتج' },
      { status: 500 }
    );
  }
}

// تعديل منتج
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const data = await req.json();

    // التحقق من أن المنتج يخص هذا الشريك
    const existingProduct = await prisma.product.findFirst({
      where: { 
        id,
        vendorId: vendor.id 
      },
      include: {
        variants: true,
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // تحديث المنتج مع المقاسات
    const product = await prisma.$transaction(async (tx) => {
      // تحضير بيانات التحديث
      const updateData: any = {
        name: data.name || existingProduct.name,
        nameAr: data.nameAr || existingProduct.nameAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        price: data.price ? parseFloat(data.price) : existingProduct.price,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        stock: data.stock !== undefined ? parseInt(data.stock) : existingProduct.stock,
        images: data.images || existingProduct.images,
        isVisible: data.isVisible !== undefined ? data.isVisible : existingProduct.isVisible,
        sizes: data.sizes || existingProduct.sizes,
        colors: data.colors || existingProduct.colors,
        productionCost: data.productionCost ? parseFloat(data.productionCost) : existingProduct.productionCost,
        categoryId: data.categoryId || existingProduct.categoryId,
      };

      // معالجة المقاسات (variants) إذا كانت موجودة
      if (data.variants && Array.isArray(data.variants)) {
        // حذف المقاسات القديمة
        await tx.productVariant.deleteMany({
          where: { productId: id }
        });

        // إضافة المقاسات الجديدة
        if (data.variants.length > 0) {
          // حساب السعر والمخزون من المقاسات
          const minPrice = Math.min(...data.variants.map((v: any) => v.price));
          const maxPrice = Math.max(...data.variants.map((v: any) => v.price));
          const totalStock = data.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
          
          updateData.price = minPrice;
          updateData.originalPrice = maxPrice > minPrice ? maxPrice : updateData.originalPrice;
          updateData.stock = totalStock;

          updateData.variants = {
            create: data.variants.map((variant: any, index: number) => ({
              variantType: variant.variantType || 'SIZE',
              name: variant.name || '',
              nameAr: variant.nameAr,
              sku: variant.sku || '',
              price: variant.price,
              stock: variant.stock || 0,
              isActive: variant.isActive !== false,
              sortOrder: variant.sortOrder || index + 1,
            })),
          };
        }
      }

      // تحديث المنتج
      return await tx.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          variants: true,
        }
      });
    });

    return NextResponse.json({ 
      message: 'تم تحديث المنتج بنجاح',
      product 
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المنتج' },
      { status: 500 }
    );
  }
}
