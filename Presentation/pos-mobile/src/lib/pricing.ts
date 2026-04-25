// src/lib/pricing.ts
import { PromotionType } from "../types/promotion";
import { type BasketItem } from "../types/sale";
import { roundTo } from "./math";

export const calculateLineTotal = (
  item: BasketItem,
  basket: BasketItem[],
): number => {
  const activePromo = item.promotions?.find((p) => p.isActive);

  if (!activePromo) {
    return roundTo(item.unitPrice * item.quantity);
  }

  const promoType = activePromo.promotionType;
  const unitPrice = item.unitPrice;
  const quantity = item.quantity;

  let total = 0;

  switch (promoType) {
    case PromotionType.Bulk: {
      const threshold = activePromo.promoQuantity ?? 0;
      const promoPrice = activePromo.promoPrice ?? 0;

      if (threshold > 0 && quantity >= threshold) {
        const numPromos = Math.floor(quantity / threshold);
        const remainder = quantity % threshold;
        total = numPromos * promoPrice + remainder * unitPrice;
      } else {
        total = unitPrice * quantity;
      }
      break;
    }

    case PromotionType.Bundle: {
      const tieUpId = activePromo.tieUpProductId;
      const tieUpRequiredQty = activePromo.tieUpQuantity ?? 1;

      const tieUpItem = basket.find((b) => b.productId === tieUpId);
      const hasTieUp = !!(tieUpItem && tieUpItem.quantity >= tieUpRequiredQty);

      if (hasTieUp) {
        total = (activePromo.promoPrice ?? unitPrice) * quantity;
      } else {
        total = unitPrice * quantity;
      }
      break;
    }

    case PromotionType.Discount: {
      total = (activePromo.promoPrice ?? unitPrice) * quantity;
      break;
    }

    default:
      total = unitPrice * quantity;
      break;
  }

  return roundTo(total);
};

// ADD THIS EXPORT:
export const calculateEffectiveUnitPrice = (
  item: BasketItem,
  basket: BasketItem[],
): number => {
  if (item.quantity <= 0) return item.unitPrice;
  const lineTotal = calculateLineTotal(item, basket);
  return roundTo(lineTotal / item.quantity);
};
