/**
 * نظام حساب الأسعار للشركاء والعملاء
 * يحدد السعر المناسب بناءً على صلاحيات المستخدم والكمية
 */

export interface PriceInfo {
  displayPrice: number;        // السعر المعروض
  originalPrice: number;        // السعر الأصلي
  isWholesalePrice: boolean;    // هل هذا سعر جملة؟
  discount: number;             // قيمة الخصم
  discountPercent: number;      // نسبة الخصم
  canUseWholesale: boolean;     // هل يمكن استخدام سعر الجملة؟
  minQuantityReached: boolean;  // هل وصل للحد الأدنى؟
  minQuantity: number;          // الحد الأدنى للجملة
  message?: string;             // رسالة توضيحية
}

export interface ProductPricing {
  price: number;
  wholesalePrice?: number | null;
  minWholesaleQuantity?: number;
}

export interface UserPermissions {
  partnerId?: string | null;
  partnerStaffPermissions?: {
    canSellWholesale?: boolean;
    wholesaleMinQuantity?: number;
  } | null;
}

/**
 * حساب معلومات السعر للمنتج
 */
export function calculatePrice(
  product: ProductPricing,
  user: UserPermissions | null | undefined,
  quantity: number = 1
): PriceInfo {
  const retailPrice = product.price;
  const wholesalePrice = product.wholesalePrice;
  const minQuantity = product.minWholesaleQuantity || 6;

  // التحقق من صلاحيات الشريك
  const isPartner = Boolean(
    user?.partnerId && 
    user?.partnerStaffPermissions?.canSellWholesale === true
  );

  // التحقق من توفر سعر الجملة
  const hasWholesalePrice = Boolean(wholesalePrice && wholesalePrice > 0);

  // التحقق من الكمية المطلوبة
  const meetsMinQuantity = quantity >= minQuantity;

  // هل يمكن استخدام سعر الجملة؟
  const canUseWholesale = isPartner && hasWholesalePrice && meetsMinQuantity;

  // السعر النهائي
  const finalPrice = canUseWholesale && wholesalePrice ? wholesalePrice : retailPrice;

  // حساب الخصم
  const discount = retailPrice - finalPrice;
  const discountPercent = retailPrice > 0 ? (discount / retailPrice) * 100 : 0;

  // رسالة توضيحية
  let message: string | undefined;
  
  if (isPartner && hasWholesalePrice) {
    if (meetsMinQuantity) {
      message = `🎉 تم تطبيق سعر الجملة! وفرت ${discount.toFixed(2)} جنيه للقطعة`;
    } else {
      const remaining = minQuantity - quantity;
      message = `💡 اطلب ${remaining} قطعة إضافية للحصول على سعر الجملة`;
    }
  }

  return {
    displayPrice: finalPrice,
    originalPrice: retailPrice,
    isWholesalePrice: canUseWholesale,
    discount,
    discountPercent,
    canUseWholesale: isPartner && hasWholesalePrice,
    minQuantityReached: meetsMinQuantity,
    minQuantity,
    message,
  };
}

/**
 * حساب إجمالي السعر مع الكمية
 */
export function calculateTotalPrice(
  product: ProductPricing,
  user: UserPermissions | null | undefined,
  quantity: number = 1
): number {
  const priceInfo = calculatePrice(product, user, quantity);
  return priceInfo.displayPrice * quantity;
}

/**
 * تنسيق السعر للعرض
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ar-EG')} جنيه`;
}

/**
 * التحقق من أن المستخدم شريك
 */
export function isPartnerUser(user: UserPermissions | null | undefined): boolean {
  return Boolean(
    user?.partnerId && 
    user?.partnerStaffPermissions?.canSellWholesale === true
  );
}
