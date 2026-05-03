import { PromotionType } from "../types/promotion";
import { BasketItem } from "../types/sale";

export const calculateBestPromo = (item: BasketItem, basket: BasketItem[]) => {
  const originalTotal = item.unitPrice * item.quantity;

  const promo = item.promotions?.find((p) => p.isActive);

  if (!promo || !promo.promoPrice || !promo.promoQuantity) {
    return {
      total: originalTotal,
      savings: 0,
      description: null,
      appliedPromoId: null,
    };
  }

  const isBulk =
    promo.type === PromotionType.Bulk || String(promo.type) === "1";

  if (isBulk && item.quantity >= promo.promoQuantity) {
    const discountedTotal = promo.promoPrice * item.quantity;
    return {
      total: discountedTotal,
      savings: originalTotal - discountedTotal,
      description: `Bulk Discount: ₱${promo.promoPrice}/unit applied`,
      appliedPromoId: promo.id,
    };
  }

  return {
    total: originalTotal,
    savings: 0,
    description: null,
    appliedPromoId: null,
  };
};
