using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Pricing
{
    public class BundlePricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bundle;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            var tieUpItem = basket.FirstOrDefault(i => i.ProductId == promo.TieUpProductId);
            int requiredTieUpQty = promo.TieUpQuantity ?? 1;

            if (tieUpItem != null && tieUpItem.Quantity >= requiredTieUpQty)
            {
                // Senior Logic: 1:1 or Ratio-based bundle application
                int maxBundles = tieUpItem.Quantity / requiredTieUpQty;
                int discountedQty = Math.Min(quantity, maxBundles);
                int regularQty = quantity - discountedQty;

                return (discountedQty * (promo.PromoPrice ?? product.Price)) + (regularQty * product.Price);
            }

            return quantity * product.Price;
        }
    }
}
