import type { PromotionTier } from "../types/promotion";
import { type BasketItem } from "../types/sale";

interface LineCalculation {
  discountedTotal: number;
  originalTotal: number;
  savings: number;
  appliedPromotionName: string | null;
}

export function calculateLineTotal(
  item: BasketItem,
  fullBasket: BasketItem[],
): LineCalculation {
  const originalTotal = item.unitPrice * item.quantity;

  // 1. Guard Rule: Return standard totals if no valid strategies are defined
  if (!item.promotions || item.promotions.length === 0) {
    return {
      discountedTotal: originalTotal,
      originalTotal,
      savings: 0,
      appliedPromotionName: null,
    };
  }

  // 2. Safely locate the running active campaign
  const promo = item.promotions.find((p) => p.isActive === true);
  if (!promo || !promo.tiers || promo.tiers.length === 0) {
    return {
      discountedTotal: originalTotal,
      originalTotal,
      savings: 0,
      appliedPromotionName: null,
    };
  }

  const strategyType = String(promo.promotionType).toLowerCase();

  // --- STRATEGY 1: FLAT DISCOUNT MARKDOWN ---
  if (strategyType === "discount") {
    // Replicates C# OrderBy(t => t.Quantity).FirstOrDefault()
    const sortedTiers = [...promo.tiers].sort(
      (a, b) => a.quantity - b.quantity,
    );
    const discountTier: PromotionTier | undefined = sortedTiers[0];
    const targetUnitPrice = discountTier ? discountTier.price : item.unitPrice;

    const discountedTotal = item.quantity * targetUnitPrice;
    return {
      discountedTotal,
      originalTotal,
      savings: Math.max(0, originalTotal - discountedTotal),
      appliedPromotionName: promo.name,
    };
  }

  // --- STRATEGY 2: COMBO BUNDLE ---
  if (strategyType === "bundle" && promo.tieUpProductId) {
    const sortedTiers = [...promo.tiers].sort(
      (a, b) => a.quantity - b.quantity,
    );
    const bundleTier: PromotionTier | undefined = sortedTiers[0];
    const bundlePrice = bundleTier ? bundleTier.price : item.unitPrice;

    const tieUpItem = fullBasket.find(
      (i) => i.productId === promo.tieUpProductId,
    );
    const tieUpInCart = tieUpItem ? tieUpItem.quantity : 0;

    const applicableBundleCount = Math.min(item.quantity, tieUpInCart);
    const regularPriceCount = item.quantity - applicableBundleCount;

    const discountedTotal =
      applicableBundleCount * bundlePrice + regularPriceCount * item.unitPrice;
    return {
      discountedTotal,
      originalTotal,
      savings: Math.max(0, originalTotal - discountedTotal),
      appliedPromotionName: applicableBundleCount > 0 ? promo.name : null,
    };
  }

  // --- STRATEGY 3: BULK PACK WHOLESALE (Mirrors C# BulkPricingStrategy exactly) ---
  if (strategyType === "bulk") {
    let total = 0;
    let remainingQuantity = item.quantity;

    // Replicates C# OrderByDescending(t => t.Quantity).ToList()
    const sortedTiers = [...promo.tiers].sort(
      (b, a) => a.quantity - b.quantity,
    );

    for (const tier of sortedTiers) {
      if (remainingQuantity >= tier.quantity) {
        const numberOfPacks = Math.floor(remainingQuantity / tier.quantity);
        total += numberOfPacks * tier.price;
        remainingQuantity %= tier.quantity;
      }
    }

    // Accumulate standard retail price for loose remainder items
    total += remainingQuantity * item.unitPrice;

    return {
      discountedTotal: total,
      originalTotal,
      savings: Math.max(0, originalTotal - total),
      appliedPromotionName: total < originalTotal ? promo.name : null,
    };
  }

  return {
    discountedTotal: originalTotal,
    originalTotal,
    savings: 0,
    appliedPromotionName: null,
  };
}
