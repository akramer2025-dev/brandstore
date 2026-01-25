import { prisma } from './prisma';

export class FabricService {
  /**
   * شراء قماش جديد
   */
  static async purchaseFabric(data: {
    name: string;
    nameAr: string;
    type: string;
    color: string;
    purchasePrice: number;
    totalLength: number;
    supplier?: string;
  }) {
    return prisma.fabric.create({
      data: {
        ...data,
        availableLength: data.totalLength,
        usedLength: 0,
      },
    });
  }

  /**
   * قص قماش لصنع قطع ملابس
   */
  static async cutFabric(data: {
    fabricId: string;
    productId: string;
    lengthUsed: number;
    quantity: number;
    notes?: string;
  }) {
    // الحصول على القماش
    const fabric = await prisma.fabric.findUnique({
      where: { id: data.fabricId },
    });

    if (!fabric) {
      throw new Error('القماش غير موجود');
    }

    if (fabric.availableLength < data.lengthUsed) {
      throw new Error(
        `الكمية المتاحة من القماش غير كافية. المتاح: ${fabric.availableLength} متر`
      );
    }

    // حساب تكلفة القطعة الواحدة
    const costPerPiece =
      (fabric.purchasePrice / fabric.totalLength) * data.lengthUsed / data.quantity;

    // إنشاء سجل القطع
    const fabricPiece = await prisma.fabricPiece.create({
      data: {
        fabricId: data.fabricId,
        productId: data.productId,
        lengthUsed: data.lengthUsed,
        quantity: data.quantity,
        costPerPiece,
        notes: data.notes,
      },
    });

    // تحديث القماش
    await prisma.fabric.update({
      where: { id: data.fabricId },
      data: {
        usedLength: {
          increment: data.lengthUsed,
        },
        availableLength: {
          decrement: data.lengthUsed,
        },
      },
    });

    // إضافة المنتجات للمخزون
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (product) {
      await prisma.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });

      // تسجيل في سجل المخزون
      await prisma.inventoryLog.create({
        data: {
          productId: data.productId,
          productName: product.name,
          changeType: 'FABRIC_CUT',
          quantity: data.quantity,
          stockBefore: product.stock,
          stockAfter: product.stock + data.quantity,
          notes: `تفصيل ${data.quantity} قطعة من قماش ${fabric.nameAr}`,
        },
      });
    }

    return fabricPiece;
  }

  /**
   * الحصول على جميع الأقمشة المتاحة
   */
  static async getAvailableFabrics() {
    return prisma.fabric.findMany({
      where: {
        availableLength: {
          gt: 0,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * الحصول على سجل التفصيل لقماش معين
   */
  static async getFabricHistory(fabricId: string) {
    return prisma.fabricPiece.findMany({
      where: { fabricId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * الحصول على تكلفة إنتاج منتج من الأقمشة
   */
  static async getProductionCost(productId: string) {
    const fabricPieces = await prisma.fabricPiece.findMany({
      where: { productId },
      include: {
        fabric: true,
      },
    });

    const totalCost = fabricPieces.reduce(
      (sum: number, piece) => sum + piece.costPerPiece * piece.quantity,
      0
    );

    const totalQuantity = fabricPieces.reduce(
      (sum: number, piece) => sum + piece.quantity,
      0
    );

    return {
      totalCost,
      totalQuantity,
      averageCostPerPiece: totalQuantity > 0 ? totalCost / totalQuantity : 0,
      fabricPieces,
    };
  }

  /**
   * حذف قماش
   */
  static async deleteFabric(fabricId: string) {
    // التحقق من عدم وجود قطع مفصلة منه
    const fabricPieces = await prisma.fabricPiece.findMany({
      where: { fabricId },
    });

    if (fabricPieces.length > 0) {
      throw new Error('لا يمكن حذف القماش لأنه تم استخدامه في التفصيل');
    }

    return prisma.fabric.delete({
      where: { id: fabricId },
    });
  }
}
