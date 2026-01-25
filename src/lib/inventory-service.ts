import { prisma } from './prisma';

export class InventoryService {
  /**
   * تحديث المخزون عند البيع (خصم تلقائي)
   */
  static async deductStock(productId: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('المنتج غير موجود');
    }

    if (product.stock < quantity) {
      throw new Error('الكمية المطلوبة غير متوفرة في المخزون');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    // تسجيل العملية في سجل المخزون
    await prisma.inventoryLog.create({
      data: {
        productId,
        productName: product.name,
        changeType: 'SALE',
        quantity: -quantity,
        stockBefore: product.stock,
        stockAfter: updatedProduct.stock,
        notes: `بيع ${quantity} قطعة`,
      },
    });

    return updatedProduct;
  }

  /**
   * إضافة مخزون (شراء منتجات جديدة)
   */
  static async addStock(productId: string, quantity: number, notes?: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('المنتج غير موجود');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId,
        productName: product.name,
        changeType: 'PURCHASE',
        quantity,
        stockBefore: product.stock,
        stockAfter: updatedProduct.stock,
        notes: notes || `إضافة ${quantity} قطعة للمخزون`,
      },
    });

    return updatedProduct;
  }

  /**
   * تعديل المخزون يدويًا
   */
  static async adjustStock(
    productId: string,
    newStock: number,
    notes: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('المنتج غير موجود');
    }

    const difference = newStock - product.stock;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId,
        productName: product.name,
        changeType: 'ADJUSTMENT',
        quantity: difference,
        stockBefore: product.stock,
        stockAfter: newStock,
        notes,
      },
    });

    return updatedProduct;
  }

  /**
   * الحصول على سجل المخزون لمنتج معين
   */
  static async getInventoryHistory(productId: string) {
    return prisma.inventoryLog.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * الحصول على المنتجات التي على وشك النفاد
   */
  static async getLowStockProducts(threshold: number = 10) {
    return prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
        },
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });
  }
}
